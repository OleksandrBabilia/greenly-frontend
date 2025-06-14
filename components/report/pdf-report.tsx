"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2, Check } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import jsPDF with no SSR to avoid document is not defined errors
const jsPDF = dynamic(() => import("jspdf"), {
  ssr: false,
})

// Dynamically import html2canvas with no SSR
const html2canvas = dynamic(() => import("html2canvas"), {
  ssr: false,
})

interface GreeningElement {
  id: string
  name: string
  unit: string
  quantity: number
  pricePerUnit: number
  total: number
  isCustom: boolean
}

interface PdfReportProps {
  selectedItems: any[]
  pricingElements: GreeningElement[]
  totalPrice: number
  resourceName: string
  resourceDescription: string
  onClose: () => void
  simplePricing?: string
}

// PDF Report component with client-side PDF generation
export function PdfReport({
  selectedItems,
  pricingElements,
  totalPrice,
  resourceName,
  resourceDescription,
  onClose,
  simplePricing,
}: PdfReportProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // Generate PDF using jsPDF - create each page individually
  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      // Import the libraries dynamically at runtime
      const jsPDFModule = await import("jspdf")
      const JsPDF = jsPDFModule.default

      // Create a new jsPDF instance
      const pdf = new JsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pdfWidth - 2 * margin

      // Helper function to add header to each page
      const addHeader = (pageTitle: string) => {
        // Logo and title
        pdf.setFillColor(34, 197, 94) // Green color
        pdf.circle(25, 25, 5, "F")
        pdf.setFontSize(18)
        pdf.setTextColor(21, 128, 61) // Green text
        pdf.text("Greenly", 35, 28)

        // Page title
        pdf.setFontSize(14)
        pdf.setTextColor(0, 0, 0)
        pdf.text(pageTitle, margin, 45)

        // Date
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Generated on ${format(new Date(), "MMMM d, yyyy")}`, pdfWidth - margin, 25, { align: "right" })

        return 55 // Return Y position after header
      }

      // Helper function to add footer with page numbers
      const addFooter = (pageNum: number, totalPages: number) => {
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        pdf.text("© Greenly - Creating eco-friendly solutions", pdfWidth / 2, pdfHeight - 15, { align: "center" })
        pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth - margin, pdfHeight - 10, { align: "right" })
      }

      // Calculate total pages needed
      const imageItems = selectedItems.filter((item) => item.type === "image" && item.image)
      const messageItems = selectedItems.filter((item) => item.type === "message")
      const estimatedImagePages = Math.ceil(imageItems.length / 2) // ~2 images per page
      const estimatedMessagePages = Math.ceil(messageItems.length / 8) // ~8 messages per page
      const totalPages =
        1 +
        (imageItems.length > 0 ? estimatedImagePages : 0) +
        (messageItems.length > 0 ? estimatedMessagePages : 0) +
        1

      let pageNumber = 1

      // PAGE 1: Project Overview and Resource Information
      let currentY = addHeader("Project Report - Overview")

      // Resource Information
      pdf.setFontSize(12)
      pdf.setTextColor(21, 128, 61)
      pdf.text("Resource Information", margin, currentY)
      currentY += 10

      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Project: ${resourceName}`, margin, currentY)
      currentY += 8

      if (resourceDescription) {
        const descLines = pdf.splitTextToSize(resourceDescription, maxWidth)
        pdf.text(descLines, margin, currentY)
        currentY += descLines.length * 5 + 10
      }

      // Content Summary
      currentY += 10
      pdf.setFontSize(12)
      pdf.setTextColor(21, 128, 61)
      pdf.text("Content Summary", margin, currentY)
      currentY += 10

      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Total Selected Items: ${selectedItems.length}`, margin, currentY)
      currentY += 6
      pdf.text(`Images: ${selectedItems.filter((i) => i.type === "image").length}`, margin, currentY)
      currentY += 6
      pdf.text(`Messages: ${selectedItems.filter((i) => i.type === "message").length}`, margin, currentY)
      currentY += 6
      pdf.text(`Greening Elements: ${pricingElements.length}`, margin, currentY)
      currentY += 6
      pdf.text(`Total Project Cost: $${totalPrice.toFixed(2)}`, margin, currentY)

      // Project Summary Box
      currentY += 15
      pdf.setFillColor(240, 253, 244) // Light green background
      pdf.rect(margin, currentY, maxWidth, 30, "F")
      pdf.setDrawColor(34, 197, 94)
      pdf.rect(margin, currentY, maxWidth, 30, "S")

      pdf.setFontSize(11)
      pdf.setTextColor(21, 128, 61)
      pdf.text("Project Summary", margin + 5, currentY + 8)
      pdf.setFontSize(9)
      pdf.setTextColor(0, 0, 0)
      pdf.text(
        `This comprehensive greening project includes ${pricingElements.length} elements`,
        margin + 5,
        currentY + 15,
      )
      pdf.text(`with a total estimated cost of $${totalPrice.toFixed(2)}.`, margin + 5, currentY + 22)

      addFooter(pageNumber++, totalPages)

      // PAGE 2+: Images (if any)
      if (imageItems.length > 0) {
        pdf.addPage()
        currentY = addHeader("Selected Images")

        for (let i = 0; i < imageItems.length; i++) {
          const item = imageItems[i]

          // Check if we need a new page (leaving space for image + text)
          if (currentY > pdfHeight - 120) {
            addFooter(pageNumber++, totalPages)
            pdf.addPage()
            currentY = addHeader("Selected Images (continued)")
          }

          try {
            // Create a temporary image element
            const img = new Image()
            img.crossOrigin = "anonymous"

            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error("Image load timeout")), 10000)
              img.onload = () => {
                clearTimeout(timeout)
                resolve(null)
              }
              img.onerror = () => {
                clearTimeout(timeout)
                reject(new Error("Image load failed"))
              }
              img.src = item.image
            })

            // Calculate image dimensions to fit within page
            const maxImgHeight = 80 // Max height in mm
            const imgRatio = img.width / img.height

            let imgWidth = maxWidth
            let imgHeight = imgWidth / imgRatio

            if (imgHeight > maxImgHeight) {
              imgHeight = maxImgHeight
              imgWidth = imgHeight * imgRatio
            }

            // Center the image horizontally
            const imgX = margin + (maxWidth - imgWidth) / 2

            // Add image to PDF
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            const imgData = canvas.toDataURL("image/jpeg", 0.9)
            pdf.addImage(imgData, "JPEG", imgX, currentY, imgWidth, imgHeight)
            currentY += imgHeight + 5

            // Add image caption
            pdf.setFontSize(9)
            pdf.setTextColor(100, 100, 100)
            pdf.text(`Image ${i + 1} - ${format(new Date(item.timestamp), "MMM d, h:mm a")}`, margin, currentY)
            currentY += 8

            // Add associated message if exists
            if (item.content) {
              pdf.setFontSize(8)
              pdf.setTextColor(0, 0, 0)
              const contentLines = pdf.splitTextToSize(item.content, maxWidth)
              pdf.text(contentLines, margin, currentY)
              currentY += contentLines.length * 3 + 15
            } else {
              currentY += 10
            }
          } catch (error) {
            console.error(`Failed to load image ${i + 1}:`, error)
            // Add placeholder for failed images
            pdf.setFillColor(245, 245, 245)
            pdf.rect(margin, currentY, maxWidth, 40, "F")
            pdf.setFontSize(10)
            pdf.setTextColor(150, 150, 150)
            pdf.text(`Image ${i + 1} - Failed to load`, margin + 5, currentY + 20)
            pdf.text(format(new Date(item.timestamp), "MMM d, h:mm a"), margin + 5, currentY + 30)
            currentY += 50
          }
        }

        addFooter(pageNumber++, totalPages)
      }

      // PAGE 3+: Messages (if any)
      if (messageItems.length > 0) {
        pdf.addPage()
        currentY = addHeader("Selected Messages")

        messageItems.forEach((item, index) => {
          // Check if we need a new page
          if (currentY > pdfHeight - 50) {
            addFooter(pageNumber++, totalPages)
            pdf.addPage()
            currentY = addHeader("Selected Messages (continued)")
          }

          // Message header
          pdf.setFontSize(10)
          pdf.setTextColor(21, 128, 61)
          pdf.text(`Message ${index + 1}`, margin, currentY)
          pdf.setTextColor(100, 100, 100)
          pdf.text(format(new Date(item.timestamp), "MMM d, h:mm a"), pdfWidth - margin, currentY, { align: "right" })
          currentY += 8

          // Message content box
          const contentLines = pdf.splitTextToSize(item.content, maxWidth - 10)
          const boxHeight = Math.max(contentLines.length * 4 + 8, 15)

          pdf.setFillColor(249, 250, 251)
          pdf.rect(margin, currentY, maxWidth, boxHeight, "F")
          pdf.setDrawColor(229, 231, 235)
          pdf.rect(margin, currentY, maxWidth, boxHeight, "S")

          pdf.setFontSize(9)
          pdf.setTextColor(0, 0, 0)
          pdf.text(contentLines, margin + 5, currentY + 6)
          currentY += boxHeight + 10
        })

        addFooter(pageNumber++, totalPages)
      }

      // FINAL PAGE: Pricing Breakdown
      pdf.addPage()
      currentY = addHeader("Pricing Breakdown")

      // Pricing table
      const colWidths = [60, 25, 25, 30, 30] // Column widths in mm
      const colX = [
        margin,
        margin + colWidths[0],
        margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      ]

      // Table header
      pdf.setFillColor(240, 253, 244) // Light green background
      pdf.rect(margin, currentY, maxWidth, 10, "F")
      pdf.setDrawColor(34, 197, 94)
      pdf.rect(margin, currentY, maxWidth, 10, "S")

      pdf.setFontSize(9)
      pdf.setTextColor(21, 128, 61)
      pdf.text("Element", colX[0] + 2, currentY + 6)
      pdf.text("Qty", colX[1] + 2, currentY + 6)
      pdf.text("Unit", colX[2] + 2, currentY + 6)
      pdf.text("Price/Unit", colX[3] + 2, currentY + 6)
      pdf.text("Total", colX[4] + 2, currentY + 6)
      currentY += 12

      // Table rows
      pdf.setTextColor(0, 0, 0)
      pricingElements.forEach((element, index) => {
        if (currentY > pdfHeight - 40) {
          addFooter(pageNumber++, totalPages)
          pdf.addPage()
          currentY = addHeader("Pricing Breakdown (continued)")
        }

        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251)
          pdf.rect(margin, currentY - 2, maxWidth, 8, "F")
        }

        pdf.setFontSize(8)
        const elementName = element.name + (element.isCustom ? " (Custom)" : "")
        const truncatedName = elementName.length > 25 ? elementName.substring(0, 22) + "..." : elementName
        pdf.text(truncatedName, colX[0] + 2, currentY + 3)
        pdf.text(element.quantity.toString(), colX[1] + 2, currentY + 3)
        pdf.text(element.unit, colX[2] + 2, currentY + 3)
        pdf.text(`$${element.pricePerUnit.toFixed(2)}`, colX[3] + 2, currentY + 3)
        pdf.text(`$${element.total.toFixed(2)}`, colX[4] + 2, currentY + 3)
        currentY += 8
      })

      // Total row
      currentY += 5
      pdf.setFillColor(34, 197, 94) // Green background
      pdf.rect(margin, currentY - 2, maxWidth, 12, "F")
      pdf.setFontSize(11)
      pdf.setTextColor(255, 255, 255)
      pdf.text("TOTAL PROJECT COST", colX[0] + 2, currentY + 5)
      pdf.text(`$${totalPrice.toFixed(2)}`, colX[4] + 2, currentY + 5)

      // API Pricing Reference (if available)
      if (simplePricing) {
        currentY += 25
        pdf.setFontSize(10)
        pdf.setTextColor(21, 128, 61)
        pdf.text("API Pricing Reference", margin, currentY)
        currentY += 8

        pdf.setFontSize(9)
        pdf.setTextColor(0, 0, 0)
        const pricingLines = pdf.splitTextToSize(simplePricing, maxWidth)
        pdf.text(pricingLines, margin, currentY)
      }

      addFooter(pageNumber, totalPages)

      // Save the PDF
      pdf.save(`greening-report-${format(new Date(), "yyyyMMdd")}.pdf`)

      setPdfGenerated(true)
      toast({
        title: "Multi-Page PDF Generated",
        description: "Your report has been downloaded with proper page sizing",
      })
    } catch (err) {
      console.error("Error generating PDF:", err)
      setError(`Failed to generate PDF: ${err.message || "Unknown error"}. Please try again.`)

      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium text-lg">Greening Project Report</h3>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Report Preview - This is an HTML representation that will be converted to PDF */}
          <div ref={reportRef} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md">
            {/* Header with logo and title */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full mr-3"></div>
                <h1 className="text-2xl font-bold text-green-700">Greenly</h1>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800">Project Report</h2>
                <p className="text-sm text-gray-500">Generated on {format(new Date(), "MMMM d, yyyy")}</p>
              </div>
            </div>

            {/* Resource Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-3 pb-1 border-b border-gray-200">
                Resource Information
              </h3>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="font-medium text-green-800 text-lg">{resourceName}</p>
                {resourceDescription && <p className="text-gray-600 mt-2">{resourceDescription}</p>}
              </div>
            </div>

            {/* Greening Elements Breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-3 pb-1 border-b border-gray-200">
                Greening Elements Breakdown
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="text-left p-3 border border-gray-200 font-medium">Element</th>
                      <th className="text-center p-3 border border-gray-200 font-medium">Quantity</th>
                      <th className="text-center p-3 border border-gray-200 font-medium">Unit</th>
                      <th className="text-right p-3 border border-gray-200 font-medium">Price per Unit</th>
                      <th className="text-right p-3 border border-gray-200 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingElements.map((element, index) => (
                      <tr key={element.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="p-3 border border-gray-200">
                          <div className="flex items-center gap-2">
                            {element.name}
                            {element.isCustom && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Custom</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center p-3 border border-gray-200 font-medium">{element.quantity}</td>
                        <td className="text-center p-3 border border-gray-200">{element.unit}</td>
                        <td className="text-right p-3 border border-gray-200">${element.pricePerUnit.toFixed(2)}</td>
                        <td className="text-right p-3 border border-gray-200 font-medium">
                          ${element.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-100">
                      <td colSpan={4} className="p-3 border border-gray-200 font-bold text-green-800">
                        Total Project Cost
                      </td>
                      <td className="text-right p-3 border border-gray-200 font-bold text-green-800 text-lg">
                        ${totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary Statistics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-blue-600">{pricingElements.length}</div>
                  <div className="text-sm text-blue-800">Total Elements</div>
                </div>
                <div className="bg-green-50 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {pricingElements.filter((e) => e.isCustom).length}
                  </div>
                  <div className="text-sm text-green-800">Custom Elements</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${(totalPrice / pricingElements.reduce((sum, e) => sum + e.quantity, 0) || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-yellow-800">Avg Cost per Unit</div>
                </div>
              </div>
            </div>

            {/* Simple Pricing from API */}
            {simplePricing && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-green-700 mb-3 pb-1 border-b border-gray-200">
                  API Pricing Reference
                </h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="font-medium text-blue-800 text-xl">{simplePricing}</p>
                  <p className="text-gray-600 mt-2 text-sm">
                    This pricing information was fetched from the external pricing API for reference.
                  </p>
                </div>
              </div>
            )}

            {/* Selected Content Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-3 pb-1 border-b border-gray-200">
                Selected Content Details
              </h3>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedItems.filter((item) => item.type === "image").length} Images
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedItems.filter((item) => item.type === "message").length} Messages
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedItems.length} Total Items
                </div>
              </div>

              {/* Display all selected items */}
              <div className="space-y-6">
                {selectedItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Item Header */}
                    <div className="bg-white px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${item.type === "image" ? "bg-blue-500" : "bg-green-500"}`}
                          ></div>
                          <span className="font-medium text-gray-800 capitalize">
                            {item.type === "image" ? "Image Content" : "Message Content"}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">#{index + 1}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(item.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>

                    {/* Item Content */}
                    <div className="p-4">
                      {item.type === "message" && (
                        <div className="bg-white p-4 rounded-md border border-gray-100">
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                          </div>
                        </div>
                      )}

                      {item.type === "image" && item.image && (
                        <div className="space-y-3">
                          {/* Image Display */}
                          <div className="bg-white p-2 rounded-md border border-gray-100">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={`Selected content ${index + 1}`}
                              className="max-h-80 max-w-full object-contain mx-auto rounded border border-gray-200"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=200&width=300"
                              }}
                            />
                          </div>

                          {/* Image Caption/Content */}
                          {item.content && (
                            <div className="bg-white p-3 rounded-md border border-gray-100">
                              <p className="text-sm text-gray-600 font-medium mb-1">Associated Message:</p>
                              <p className="text-gray-700 text-sm whitespace-pre-wrap">{item.content}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Content Summary */}
              <div className="mt-6 bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">Content Summary</h4>
                <p className="text-sm text-blue-700">
                  This report includes {selectedItems.length} selected items from your conversation with Greenly. The
                  content above represents the specific images and messages you chose to include in this greening
                  project analysis, providing context for the pricing calculations and project scope.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Greenly - All rights reserved</p>
              <p className="mt-1">Creating eco-friendly solutions for a sustainable future</p>
              <p className="mt-2 text-xs">
                This report was generated using Greenly's AI-powered pricing calculator and includes customizable
                greening elements with real-time cost calculations.
              </p>
            </div>
          </div>

          {/* PDF Generation */}
          <div className="flex flex-col items-center justify-center gap-4">
            {error && <p className="text-red-500">{error}</p>}

            <Button
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating PDF...
                </>
              ) : pdfGenerated ? (
                <>
                  <Download className="h-5 w-5" />
                  Download Again
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Generate & Download PDF
                </>
              )}
            </Button>

            {pdfGenerated && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <Check className="h-5 w-5" />
                <p>PDF Generated Successfully!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
