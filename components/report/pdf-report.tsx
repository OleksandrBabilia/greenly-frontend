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

  // Generate PDF using jsPDF and html2canvas
  const handleGeneratePdf = async () => {
    if (!reportRef.current) return

    try {
      setIsGenerating(true)
      setError(null)

      // Import the libraries dynamically at runtime
      const jsPDFModule = await import("jspdf")
      const html2canvasModule = await import("html2canvas")

      const JsPDF = jsPDFModule.default
      const html2canvasFunc = html2canvasModule.default

      // Create a new jsPDF instance
      const pdf = new JsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Use html2canvas to capture the report as an image
      const canvas = await html2canvasFunc(reportRef.current, {
        scale: 1.5, // Slightly lower scale for better performance with images
        useCORS: true, // Enable CORS for images
        allowTaint: true, // Allow tainted canvas if CORS fails
        logging: false,
        backgroundColor: "#ffffff",
        imageTimeout: 20000, // Longer timeout for multiple images
        removeContainer: true, // Clean up after rendering
        foreignObjectRendering: false, // Better compatibility with images
        onclone: (clonedDoc) => {
          // Find all images in the cloned document and set crossOrigin
          const images = clonedDoc.getElementsByTagName("img")
          for (let i = 0; i < images.length; i++) {
            images[i].crossOrigin = "anonymous"
            // Add loading attribute for better performance
            images[i].loading = "eager"
          }
          return clonedDoc
        },
      })

      // Make sure we have a valid canvas before proceeding
      if (!canvas || typeof canvas.toDataURL !== "function") {
        throw new Error("Failed to generate canvas from HTML")
      }

      // Add the captured image to the PDF
      const imgData = canvas.toDataURL("image/jpeg", 1.0)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10 // Top margin

      pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)

      // Add a footer
      const footerText = `Generated on ${format(new Date(), "MMMM d, yyyy")} by Greenly`
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(footerText, pdfWidth / 2, pdfHeight - 10, { align: "center" })

      // Save the PDF
      pdf.save(`greening-report-${format(new Date(), "yyyyMMdd")}.pdf`)

      setPdfGenerated(true)
      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded",
      })
    } catch (err) {
      console.error("Error generating PDF:", err)
      setError(`Failed to generate PDF: ${err.message || "Unknown error"}. Please try again.`)

      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      })

      // Try a fallback approach if the main approach fails
      try {
        const jsPDFModule = await import("jspdf")
        const JsPDF = jsPDFModule.default

        // Create a simple PDF with just text as a fallback
        const pdf = new JsPDF()
        pdf.setFontSize(16)
        pdf.text("Greenly Project Report", 20, 20)
        pdf.setFontSize(12)
        pdf.text(`Resource: ${resourceName}`, 20, 30)
        pdf.text(`Generated on: ${format(new Date(), "MMMM d, yyyy")}`, 20, 40)
        pdf.text(`Total Price: $${totalPrice.toFixed(2)}`, 20, 50)
        pdf.text(`Elements: ${pricingElements.length} items`, 20, 60)
        pdf.text(`Selected Content: ${selectedItems.length} items`, 20, 70)
        pdf.text(`- Images: ${selectedItems.filter((i) => i.type === "image").length}`, 20, 80)
        pdf.text(`- Messages: ${selectedItems.filter((i) => i.type === "message").length}`, 20, 90)
        pdf.text("Note: This is a simplified report due to rendering issues.", 20, 100)

        pdf.save(`greening-report-${format(new Date(), "yyyyMMdd")}.pdf`)

        setPdfGenerated(true)
        toast({
          title: "Simple PDF Generated",
          description: "A simplified report has been downloaded",
        })
      } catch (fallbackErr) {
        console.error("Fallback PDF generation failed:", fallbackErr)
      }
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
