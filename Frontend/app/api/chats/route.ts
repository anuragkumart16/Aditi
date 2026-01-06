import { prisma } from "@/lib/prismaClient";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
        return new NextResponse("Missing userId", { status: 400 });
    }

    try {
        const chats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: 50,
        });

        return NextResponse.json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
