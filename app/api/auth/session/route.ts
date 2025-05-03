import { type NextRequest, NextResponse } from "next/server"
import { GOOGLE_USERINFO_URL, ACCESS_TOKEN_COOKIE } from "@/utils/api-config"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json({ isAuthenticated: false, user: null })
    }

    // Get user info from Google
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userInfoResponse.ok) {
      // Token might be expired
      return NextResponse.json({ isAuthenticated: false, user: null })
    }

    const userData = await userInfoResponse.json()

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        image: userData.picture,
      },
    })
  } catch (error) {
    console.error("Error getting session:", error)
    return NextResponse.json({ isAuthenticated: false, user: null })
  }
}
