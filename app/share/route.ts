import { NextResponse } from "next/server"
import { storeSharedImage, getSharedImage } from "@/lib/redis-utils"

export async function POST(req: Request) {
  try {
    const { image, image_name, user_id } = await req.json()

    // Log the request details
    console.log("Image share request received:")
    console.log(`- User ID: ${user_id || "anonymous"}`)
    console.log(`- Image name: ${image_name || "not provided"}`)
    console.log(`- Has image data: ${!!image}`)

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Image data is required",
        },
        { status: 400 },
      )
    }

    // Store the image in Redis
    const shareId = await storeSharedImage(image, image_name, user_id)

    // Generate the share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/share/${shareId}`

    return NextResponse.json({
      success: true,
      share_url: shareUrl,
      share_id: shareId,
      message: "Image shared successfully",
    })
  } catch (error) {
    console.error("Error processing image share request:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to share image",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    // Extract share ID from the URL
    const url = new URL(req.url)
    const shareId = url.searchParams.get("id")

    if (!shareId) {
      return NextResponse.json({ error: "Share ID is required" }, { status: 400 })
    }

    console.log(`Fetching shared image with ID: ${shareId}`)

    // Get the shared image from Redis
    const imageData = await getSharedImage(shareId)

    if (!imageData) {
      return NextResponse.json(
        {
          success: false,
          error: "Shared image not found or has expired",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      image: imageData,
    })
  } catch (error) {
    console.error("Error fetching shared image:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shared image",
      },
      { status: 500 },
    )
  }
}
