import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
        return NextResponse.redirect(new URL("/auth", req.url))
    }

    const storedState = req.cookies.get("oauth_state")?.value

    if (state !== storedState) {
        return NextResponse.redirect(new URL("/auth", req.url))
    }

    // exchange code for access token
    const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
        }),
    })
    const data = await response.json()

    if (!data.access_token) {
        return new NextResponse("Authentication failed", { status: 401 })
    }

    // exchange access token for user info
    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${data.access_token}`,
        },
    })
    const userData = await userResponse.json()

    // create user in db
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                userId: userData.login,
            }
        })

        if (existingUser) {
            const response = NextResponse.redirect(new URL("/chat", req.url))
            response.cookies.set("user", existingUser.userId)
            return response
        }

        const user = await prisma.user.create({
            data: {
                userId: userData.login,
                name: userData.name,
                email: userData.email,
                userImage: userData.avatar_url,
            }
        })

        const apiresponse = NextResponse.redirect(new URL("/chat", req.url))

        apiresponse.cookies.set("user", user.userId)

        return apiresponse
    } catch (error) {
        return new NextResponse("User creation failed", { status: 500 })
    }

}