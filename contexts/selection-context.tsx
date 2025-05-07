"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type SelectedItem = {
  id: string
  type: "message" | "image"
  content: string
  image?: string
  timestamp: Date
}

type SelectionContextType = {
  selectedItems: SelectedItem[]
  isSelectionMode: boolean
  toggleSelectionMode: () => void
  toggleItemSelection: (item: SelectedItem) => void
  isItemSelected: (id: string) => boolean
  clearSelection: () => void
  selectedCount: number
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      // Clear selection when exiting selection mode
      setSelectedItems([])
    }
    setIsSelectionMode(!isSelectionMode)
  }

  const toggleItemSelection = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id)
      if (isSelected) {
        return prev.filter((i) => (i.id === item.id ? false : true))
      } else {
        return [...prev, item]
      }
    })
  }

  const isItemSelected = (id: string) => {
    return selectedItems.some((item) => item.id === id)
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  return (
    <SelectionContext.Provider
      value={{
        selectedItems,
        isSelectionMode,
        toggleSelectionMode,
        toggleItemSelection,
        isItemSelected,
        clearSelection,
        selectedCount: selectedItems.length,
      }}
    >
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider")
  }
  return context
}
