import { SystemPrompt } from "@/aditi/systemPrompt";
import { prisma } from "@/lib/prismaClient";

export async function POST(req: Request) {
    const body = await req.json();
    const { message, userId, chatId } = body;

    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    let currentChatId = chatId;

    // 1. Create chat if it doesn't exist
    if (!currentChatId) {
        const chat = await prisma.chat.create({
            data: {
                userId: userId,
                title: message.substring(0, 50) + "...",
            },
        });
        currentChatId = chat.id;
    }

    // 2. Save User Message
    await prisma.message.create({
        data: {
            chatId: currentChatId,
            role: "user",
            content: message,
        },
    });

    // 3. Fetch History
    const history = await prisma.message.findMany({
        where: { chatId: currentChatId },
        orderBy: { createdAt: "asc" },
    });

    // 4. Construct Prompt
    const systemPrompt = SystemPrompt();

    // Format history for the model
    // Note: We might want to limit history length to fit context window
    const conversationHistory = history
        .map((msg) => {
            if (msg.role === "user") return `<|user|>\n${msg.content}`;
            if (msg.role === "assistant") return `<|assistant|>\n${msg.content}`;
            return "";
        })
        .join("\n");

    const finalPrompt = `
<|system|>
${systemPrompt}
${conversationHistory}
<|assistant|>
`;

    console.log("Sending key:", process.env.INTERNAL_API_KEY);

    const hfResponse = await fetch(
        "https://delusion01-aditiai.hf.space/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-internal-key": process.env.INTERNAL_API_KEY!,
            },
            body: JSON.stringify({
                prompt: finalPrompt,
                max_new_tokens: body.max_new_tokens ?? 512,
                temperature: body.temperature ?? 0.7,
                top_p: body.top_p ?? 0.9,
                top_k: body.top_k ?? 50,
            }),
        }
    );

    if (!hfResponse.body) {
        return new Response("Backend Error", { status: 500 });
    }

    // 5. Intercept Stream to Save Response
    const reader = hfResponse.body.getReader();
    const encoder = new TextEncoder();

    // We'll accumulate the text here to save it later
    let accumulatedResponse = "";

    const stream = new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    // Accumulate for saving
                    const chunk = new TextDecoder().decode(value, { stream: true });
                    accumulatedResponse += chunk;

                    // Pass through to client
                    controller.enqueue(value);
                }

                // Final flush for decoder if needed (though usually stream:true handles it)

                controller.close();

                // 6. Save Assistant Message to DB
                if (accumulatedResponse.trim()) {
                    try {
                        await prisma.message.create({
                            data: {
                                chatId: currentChatId,
                                role: "assistant",
                                content: accumulatedResponse,
                            },
                        });
                    } catch (dbError) {
                        console.error("Failed to save assistant message:", dbError);
                    }
                }

            } catch (error) {
                controller.error(error);
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream", // or text/plain
            "Cache-Control": "no-cache",
            "X-Chat-Id": currentChatId,
        },
    });
}
