import { NextResponse } from "next/server"
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  AUTH_STATE_COOKIE,
  AUTH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} from "@/utils/api-config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/"))
    }

    // Get the current origin and convert it to use nip.io if it's an IP address
    const origin = new URL(request.url).origin
    const ipRegex = /^http:\/\/(\d+\.\d+\.\d+\.\d+)(?::(\d+))?$/
    const match = origin.match(ipRegex)

    let redirectUri = `${origin}/api/auth/callback/google`

    if (match) {
      // It's an IP address, convert to nip.io format
      const ip = match[1]
      const port = match[2] || ""
      const nipIoOrigin = `http://${ip}.nip.io${port ? `:${port}` : ""}`
      redirectUri = `${nipIoOrigin}/api/auth/callback/google`
    }
    redirectUri = "http://192.168.0.103.nip.io:3000/api/auth/callback/google"
    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for tokens:", await tokenResponse.text())
      return NextResponse.redirect(new URL("/?auth_error=token_exchange_failed", origin))
    }

    const tokenData = await tokenResponse.json()

    // Set cookies with the tokens
    const response = NextResponse.redirect(new URL("http://192.168.0.103.nip.io:3000/"))

    // Set secure HTTP-only cookies
    response.cookies.set(ACCESS_TOKEN_COOKIE, tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    })

    if (tokenData.refresh_token) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: REFRESH_COOKIE_MAX_AGE,
        path: "/",
      })
    }

    // Set a client-accessible cookie to indicate authentication status
    response.cookies.set(AUTH_STATE_COOKIE, "true", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in Google callback:", error)
    return NextResponse.redirect(new URL("/?auth_error=callback_error", request.url))
  }
}
