import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
    const state = crypto.randomUUID()

    const url = new URL("https://github.com/login/oauth/authorize")
    url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!)
    url.searchParams.set("redirect_uri", process.env.APP_URL! + "/api/auth/callback")
    url.searchParams.set("state", state)
    url.searchParams.set("scope", "read:user user:email")


    const response = NextResponse.redirect(url.toString(), 302)

    response.cookies.set("oauth_state", state, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 5,
    });

    return response;
}
