"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prismaClient"

export async function getUser() {
    const cookieStore = await cookies()
    const user = cookieStore.get("user")?.value

    if (!user) {
        return null
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            userId: user,
        }
    })
    return existingUser
}

