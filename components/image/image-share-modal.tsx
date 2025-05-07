"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Share2, Twitter, Facebook, Linkedin, Mail, Link } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface ImageShareModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageName?: string
}

export function ImageShareModal({ isOpen, onClose, imageUrl, imageName }: ImageShareModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("link")
  const [copied, setCopied] = useState(false)
  const [shareableLink, setShareableLink] = useState("")
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)

  // Generate a shareable link for the image
  const generateShareableLink = async () => {
    setIsGeneratingLink(true)

    try {
      // In a real implementation, you would upload the image to a storage service
      // and get a permanent URL. For this demo, we'll simulate the process.
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll use a mock URL
      // In a real app, this would be the URL returned from your image hosting service
      const mockShareableUrl = `https://greenly.app/share/${Date.now()}-${imageName || "image"}`
      setShareableLink(mockShareableUrl)

      toast({
        title: "Link generated",
        description: "Your shareable link is ready to copy",
      })
    } catch (error) {
      console.error("Error generating shareable link:", error)
      toast({
        title: "Error",
        description: "Failed to generate shareable link",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  // Copy the shareable link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  // Share to social media
  const shareToSocial = (platform: string) => {
    // We need a public URL to share, so we'll use the shareable link
    // If no link has been generated yet, generate one first
    if (!shareableLink) {
      generateShareableLink().then(() => {
        performSocialShare(platform)
      })
    } else {
      performSocialShare(platform)
    }
  }

  // Perform the actual social media sharing
  const performSocialShare = (platform: string) => {
    const text = "Check out this eco-friendly image I created with Greenly!"
    let url = ""

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableLink)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`
        break
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`
        break
      case "email":
        url = `mailto:?subject=${encodeURIComponent("Eco-friendly image from Greenly")}&body=${encodeURIComponent(
          `${text}\n\n${shareableLink}`,
        )}`
        break
      default:
        console.error("Unknown platform:", platform)
        return
    }

    // Open the sharing URL in a new window
    window.open(url, "_blank", "noopener,noreferrer")

    toast({
      title: "Sharing initiated",
      description: `Opening ${platform} to share your image`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Image
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Image preview */}
          <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
            <Image src={imageUrl || "/placeholder.svg"} alt="Image to share" fill className="object-contain" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span>Share Link</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Social Media</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="pt-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Generate a shareable link for this image that you can send to others.
                </p>

                {!shareableLink ? (
                  <Button
                    onClick={generateShareableLink}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isGeneratingLink}
                  >
                    {isGeneratingLink ? "Generating..." : "Generate Shareable Link"}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input value={shareableLink} readOnly className="flex-1" />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="icon"
                      className={copied ? "text-green-600 border-green-600" : ""}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="social" className="pt-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Share this image directly to your social media accounts.</p>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => shareToSocial("twitter")}
                    variant="outline"
                    className="flex items-center gap-2 justify-center"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter/X</span>
                  </Button>

                  <Button
                    onClick={() => shareToSocial("facebook")}
                    variant="outline"
                    className="flex items-center gap-2 justify-center"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </Button>

                  <Button
                    onClick={() => shareToSocial("linkedin")}
                    variant="outline"
                    className="flex items-center gap-2 justify-center"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </Button>

                  <Button
                    onClick={() => shareToSocial("email")}
                    variant="outline"
                    className="flex items-center gap-2 justify-center"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
