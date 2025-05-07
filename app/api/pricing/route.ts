import { NextResponse } from "next/server"

export async function GET(req: Request) {
  // Simple endpoint that returns a fixed pricing schema
  return NextResponse.json({
    pricing_schema: "100 USD",
  })
}
