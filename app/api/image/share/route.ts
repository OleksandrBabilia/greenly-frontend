import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { setCachedSharedImage, getCachedSharedImage } from "@/lib/redis-cache"

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

    // Generate a unique share ID
    const shareId = uuidv4()

    // Create image data object
    const imageData = {
      id: shareId,
      url: image,
      name: image_name || `shared-image-${shareId}.png`,
      created_at: new Date().toISOString(),
      user_id: user_id || "anonymous",
      metadata: {
        width: 800, // Default values, in a real app you'd extract these from the image
        height: 600,
        format: "png",
      },
    }

    // Store in your primary backend (this would be your actual API call)
    // In a real implementation, you would call your backend API here
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/images/share`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ image, image_name, user_id }),
    // });
    // const backendData = await backendResponse.json();
    // const shareId = backendData.share_id;

    // Cache the image data in Redis
    await setCachedSharedImage(shareId, imageData)

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

    // Try to get from cache first
    const cachedImage = await getCachedSharedImage(shareId)

    if (cachedImage) {
      console.log("Cache hit: Returning cached shared image")
      return NextResponse.json({
        success: true,
        image: cachedImage,
        source: "cache",
      })
    }

    console.log("Cache miss: Fetching shared image from backend")

    // If not in cache, fetch from your backend API
    // In a real implementation, you would call your backend API here
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/images/${shareId}`);
    // if (!backendResponse.ok) {
    //   throw new Error(`Backend API returned ${backendResponse.status}`);
    // }
    // const backendData = await backendResponse.json();

    // For demo purposes, we'll simulate a backend response
    // In a real app, you would use the actual backend response
    const mockImageData = {
      id: shareId,
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjlmMCIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiM0YWRlODAiLz48cGF0aCBkPSJNMTYwIDEyMEMyMDAgODAgMjQwIDEyMCAyNDAgMTIwQzI0MCAxMjAgMjgwIDE2MCAyNDAgMjAwQzIwMCAyNDAgMTYwIDIwMCAxNjAgMjAwQzE2MCAyMDAgMTIwIDE2MCAxNjAgMTIwWiIgZmlsbD0iIzIyYzU1ZSIvPjxwYXRoIGQ9Ik0yMDAgNzBMMjEwIDkwTDIzMCA5MEwyMTUgMTA1TDIyMCAxMjVMMjAwIDExNUwxODAgMTI1TDE4NSAxMDVMMTcwIDkwTDE5MCA5MFoiIGZpbGw9IiMxNmEzNGEiLz48L3N2Zz4=",
      name: `shared-image-${shareId}.png`,
      created_at: new Date().toISOString(),
      metadata: {
        width: 400,
        height: 300,
        format: "png",
      },
    }

    // Cache the result for future requests
    await setCachedSharedImage(shareId, mockImageData)

    return NextResponse.json({
      success: true,
      image: mockImageData,
      source: "backend",
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
