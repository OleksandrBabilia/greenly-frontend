"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface ResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (resourceName: string, resourceDescription: string) => Promise<void>
}

export function ResourceModal({ isOpen, onClose, onSubmit }: ResourceModalProps) {
  const [resourceName, setResourceName] = useState("")
  const [resourceDescription, setResourceDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!resourceName.trim()) {
      setError("Resource name is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit(resourceName, resourceDescription)
      // Reset form
      setResourceName("")
      setResourceDescription("")
      onClose()
    } catch (err) {
      setError("Failed to submit resource information")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resource Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resourceName">Resource Name</Label>
            <Input
              id="resourceName"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              placeholder="Enter the main resource name"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceDescription">Resource Description (Optional)</Label>
            <Textarea
              id="resourceDescription"
              value={resourceDescription}
              onChange={(e) => setResourceDescription(e.target.value)}
              placeholder="Describe the resource in more detail"
              disabled={isSubmitting}
              className="min-h-[100px]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
