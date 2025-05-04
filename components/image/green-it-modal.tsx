"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Leaf, Loader2 } from "lucide-react"
import Image from "next/image"

interface GreenItModalProps {
  isOpen: boolean
  onClose: () => void
  originalImage: string | null
  currentImage: string
  onSubmit: (positivePrompt: string, negativePrompt: string) => Promise<void>
}

export function GreenItModal({ isOpen, onClose, originalImage, currentImage, onSubmit }: GreenItModalProps) {
  const [positivePrompt, setPositivePrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [step, setStep] = useState<"positive" | "negative" | "processing">("positive")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (step === "positive" && positivePrompt.trim()) {
      setStep("negative")
    }
  }

  const handleSubmit = async () => {
    if (!positivePrompt.trim()) return

    try {
      setIsSubmitting(true)
      setStep("processing")
      await onSubmit(positivePrompt, negativePrompt)
      // Reset form after successful submission
      setPositivePrompt("")
      setNegativePrompt("")
      setStep("positive")
      onClose()
    } catch (error) {
      console.error("Error submitting Green It request:", error)
      // Stay on negative prompt step if there's an error
      setStep("negative")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (step === "positive") {
        handleNext()
      } else if (step === "negative") {
        handleSubmit()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <Leaf className="h-5 w-5" />
            Green It
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Images preview */}
          <div className="flex gap-2 justify-center">
            {originalImage && (
              <div className="relative w-[120px] h-[120px]">
                <div className="absolute inset-0 bg-gray-100 rounded-md overflow-hidden">
                  <Image src={originalImage || "/placeholder.svg"} alt="Original image" fill className="object-cover" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Original
                </div>
              </div>
            )}
            <div className="relative w-[120px] h-[120px]">
              <div className="absolute inset-0 bg-gray-100 rounded-md overflow-hidden">
                <Image src={currentImage || "/placeholder.svg"} alt="Current image" fill className="object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Current
              </div>
            </div>
          </div>

          {/* Chat-like interface */}
          <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
            {/* Assistant message */}
            <div className="flex mb-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
                {step === "positive" && <p>What would you like to see in the eco-friendly version of this image?</p>}
                {step === "negative" && <p>What would you like to avoid in the eco-friendly version?</p>}
                {step === "processing" && <p>Processing your request to create an eco-friendly version...</p>}
              </div>
            </div>

            {/* User response for positive prompt */}
            {(step === "negative" || step === "processing") && (
              <div className="flex justify-end mb-4">
                <div className="bg-green-600 text-white rounded-lg p-3 text-sm">
                  <p>{positivePrompt}</p>
                </div>
              </div>
            )}

            {/* Assistant follow-up for negative prompt */}
            {(step === "negative" || step === "processing") && (
              <div className="flex mb-4">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
                  <p>What would you like to avoid in the eco-friendly version?</p>
                </div>
              </div>
            )}

            {/* User response for negative prompt */}
            {step === "processing" && negativePrompt && (
              <div className="flex justify-end mb-4">
                <div className="bg-green-600 text-white rounded-lg p-3 text-sm">
                  <p>{negativePrompt}</p>
                </div>
              </div>
            )}

            {/* Processing indicator */}
            {step === "processing" && (
              <div className="flex mb-4">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Creating your eco-friendly image...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          {step !== "processing" && (
            <div className="relative">
              <Textarea
                value={step === "positive" ? positivePrompt : negativePrompt}
                onChange={(e) =>
                  step === "positive" ? setPositivePrompt(e.target.value) : setNegativePrompt(e.target.value)
                }
                placeholder={
                  step === "positive" ? "Describe what you'd like to see..." : "Describe what you'd like to avoid..."
                }
                className="min-h-[80px] pr-24 border-green-200 focus-visible:ring-green-500"
                onKeyDown={handleKeyDown}
              />
              <div className="absolute bottom-2 right-2">
                <Button
                  onClick={step === "positive" ? handleNext : handleSubmit}
                  disabled={step === "positive" ? !positivePrompt.trim() : isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {step === "positive" ? "Next" : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
