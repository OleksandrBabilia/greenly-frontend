"use client"

import type React from "react"

import { useState, useRef } from "react"

export function useImageHandler() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialFileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (initialFileInputRef.current) {
      initialFileInputRef.current.value = ""
    }
  }

  const resetImageInputs = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (initialFileInputRef.current) {
      initialFileInputRef.current.value = ""
    }
  }

  return {
    selectedImage,
    setSelectedImage,
    isDragging,
    fileInputRef,
    initialFileInputRef,
    handleImageSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeSelectedImage,
    resetImageInputs,
  }
}
