
import { prisma } from "@/lib/prismaClient";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    const { chatId } = await params;

    if (!chatId) {
        return new NextResponse("Missing chatId", { status: 400 });
    }

    try {
        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
