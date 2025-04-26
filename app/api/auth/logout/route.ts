import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear all auth cookies
  response.cookies.set("greenly_access_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  response.cookies.set("greenly_refresh_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  response.cookies.set("greenly_authenticated", "", {
    expires: new Date(0),
    path: "/",
  })

  return response
}
