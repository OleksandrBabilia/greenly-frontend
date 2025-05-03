import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, AUTH_STATE_COOKIE } from "@/utils/api-config"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear all auth cookies
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  response.cookies.set(AUTH_STATE_COOKIE, "", {
    expires: new Date(0),
    path: "/",
  })

  return response
}
