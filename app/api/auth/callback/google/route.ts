import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/", request.url))
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

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("http://localhost:8080/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: "",
        client_secret: "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for tokens:", await tokenResponse.text())
      return NextResponse.redirect(new URL("/?auth_error=token_exchange_failed", request.url))
    }

    const tokenData = await tokenResponse.json()

    // Set cookies with the tokens
    const response = NextResponse.redirect(new URL("/", request.url))

    // Set secure HTTP-only cookies
    response.cookies.set("greenly_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    })

    if (tokenData.refresh_token) {
      response.cookies.set("greenly_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }

    // Set a client-accessible cookie to indicate authentication status
    response.cookies.set("greenly_authenticated", "true", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error in Google callback:", error)
    return NextResponse.redirect(new URL("/?auth_error=callback_error", request.url))
  }
}
