"use client"

import Image from "next/image"
import { useState } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatHeaderImageProps {
  mainImage?: string
  objectName?: string
}

export function ChatHeaderImage({ mainImage, objectName }: ChatHeaderImageProps) {
  const [expanded, setExpanded] = useState(false)

  if (!mainImage) return null

  return (
    <div className="border-b border-green-100 bg-white py-2 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <div className={`relative ${expanded ? "w-full" : "w-16 h-16"}`}>
            <Image
              src={mainImage || "/placeholder.svg"}
              alt="Main conversation image"
              width={expanded ? 400 : 64}
              height={expanded ? 300 : 64}
              className={`rounded-md object-cover cursor-pointer ${expanded ? "max-h-[300px] w-auto" : "h-16 w-16"}`}
              onClick={() => setExpanded(!expanded)}
            />
          </div>

          <div className="flex-1">
            {objectName && (
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-medium text-gray-700">{objectName}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Main object in this conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <p className="text-xs text-gray-500">{expanded ? "Click to minimize" : "Click to expand"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
