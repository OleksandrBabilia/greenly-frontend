"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { downloadImage } from "@/services/image-service"
import { useToast } from "@/hooks/use-toast"
import { convertToNipIo } from "@/utils/nip-io"
import { getApiUrl } from "@/utils/api-config"

interface SharedImage {
  id: string
  url: string
  name: string
  created_at: string
  metadata: {
    width: number
    height: number
    format: string
  }
}

export default function SharePage() {
  const params = useParams()
  const { toast } = useToast()
  const [image, setImage] = useState<SharedImage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedImage = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get the share ID from the URL
        const shareId = params.id

        if (!shareId) {
          throw new Error("Invalid share ID")
        }

        // Fetch the shared image data
        const shareUrl = convertToNipIo(getApiUrl(`image/share?id=${shareId}`))
        const response = await fetch(shareUrl)

        if (!response.ok) {
          throw new Error(`Failed to fetch shared image: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success || !data.image) {
          throw new Error("Failed to load shared image")
        }

        setImage(data.image)
      } catch (error) {
        console.error("Error fetching shared image:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSharedImage()
  }, [params.id])

  // Handle image download
  const handleDownload = () => {
    if (!image) return

    downloadImage(image.url, image.name)

    toast({
      title: "Image downloaded",
      description: "The image has been saved to your device.",
    })
  }

  // Handle sharing
  const handleShare = async () => {
    if (!image) return

    try {
      // Use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: "Eco-friendly image from Greenly",
          text: "Check out this eco-friendly image I created with Greenly!",
          url: window.location.href,
        })

        toast({
          title: "Sharing initiated",
          description: "Opening share dialog",
        })
      } else {
        // Fallback to copying the URL
        await navigator.clipboard.writeText(window.location.href)

        toast({
          title: "Link copied!",
          description: "Share URL copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)

      toast({
        title: "Sharing failed",
        description: "Failed to share the image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container px-4 mx-auto flex items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-green-500 rounded-full"></div>
            <h1 className="text-xl font-bold text-green-700">Greenly</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container px-4 py-8 mx-auto max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-medium text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        ) : image ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shared Eco-Friendly Image</h2>
              <p className="text-gray-600 mb-6">
                This eco-friendly image was created and shared using Greenly, an AI assistant focused on sustainability.
              </p>
            </div>

            <div className="relative bg-gray-100 flex justify-center items-center p-4">
              <Image
                src={image.url || "/placeholder.svg"}
                alt="Shared eco-friendly image"
                width={800}
                height={600}
                className="max-h-[600px] w-auto object-contain rounded-md"
              />
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h3 className="font-medium text-gray-800">{image.name}</h3>
                  <p className="text-sm text-gray-500">
                    Shared on {new Date(image.created_at).toLocaleDateString()} •{image.metadata.width}×
                    {image.metadata.height} • {image.metadata.format.toUpperCase()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </Button>

                  <Button
                    onClick={handleShare}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-medium text-yellow-700 mb-2">Image Not Found</h2>
            <p className="text-yellow-600">The shared image could not be found or has expired.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container px-4 mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Greenly. All rights reserved.</p>
          <p className="mt-2">Creating eco-friendly images for a sustainable future.</p>
        </div>
      </footer>
    </div>
  )
}
