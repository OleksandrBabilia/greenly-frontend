"use client"

import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"
import { useSelection } from "@/contexts/selection-context"

interface SelectionToolbarProps {
  onGenerateReport: () => void
}

export function SelectionToolbar({ onGenerateReport }: SelectionToolbarProps) {
  const { isSelectionMode, toggleSelectionMode, selectedCount, clearSelection } = useSelection()

  return (
    <div
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300 ${
        isSelectionMode ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-full shadow-lg border border-green-100 px-4 py-2 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSelectionMode}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>

        <div className="h-6 border-l border-gray-200"></div>

        <div className="text-sm font-medium text-gray-700">
          {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
        </div>

        <div className="h-6 border-l border-gray-200"></div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelection}
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
        >
          Clear
        </Button>

        <Button
          onClick={onGenerateReport}
          disabled={selectedCount === 0}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  )
}
