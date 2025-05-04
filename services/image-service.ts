/**
 * Service for handling image processing and transformations
 */

import { convertToNipIo } from "@/utils/nip-io";
import { getApiUrl } from "@/utils/api-config"
// Function to send a Green It request to the server
export async function sendGreenItRequest(
    originalImage: string | null,
    currentImage: string,
    positivePrompt: string,
    negativePrompt: string,
    chatId?: string,
    imageName?: string,
    userId?: string,
  ): Promise<{ success: boolean; processedImage?: string; processedImageName?: string; error?: string }> {
    try {
      // Prepare the request body
      const requestBody = {
        original_image: originalImage,
        current_image: currentImage,
        positive_prompt: positivePrompt,
        negative_prompt: negativePrompt,
        chat_id: chatId,
        image_name: imageName,
        user_id: userId,
      }
      console.log("Sending Green It request with the following data:", requestBody)
 
      // Send the request to the server

    // Debug log
      const chatUrl = convertToNipIo(getApiUrl("inplant/"))
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
  
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
  
      const data = await response.json()
      return {
        success: true,
        processedImage: data.processed_image,
        processedImageName: data.processed_image_name,
      }
    } catch (error) {
      console.error("Error in Green It request:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }
  
  // Function to download an image
  export function downloadImage(imageUrl: string, imageName?: string) {
    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = imageUrl
  
    // Use the provided image name if available, otherwise generate a default name
    const filename = imageName || "greenly-image.png"
    link.download = filename
  
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  