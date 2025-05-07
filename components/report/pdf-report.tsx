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

// PDF Report component with client-side PDF generation
export function PdfReport({ selectedItems, pricingSchema, resourceName, resourceDescription, onClose, simplePricing }) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // Ensure pricing schema has all required properties with default values
  const pricingData = {
    basePrice: pricingSchema?.basePrice || 0,
    additionalCosts: pricingSchema?.additionalCosts || [],
    totalPrice: pricingSchema?.totalPrice || 0,
    currency: pricingSchema?.currency || "USD",
    notes: pricingSchema?.notes || "No additional notes.",
    estimatedTimeframe: pricingSchema?.estimatedTimeframe || "Not specified",
  }

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
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        allowTaint: true, // Allow tainted canvas if CORS fails
        logging: false,
        backgroundColor: "#ffffff",
        imageTimeout: 15000, // Longer timeout for images
        onclone: (clonedDoc) => {
          // Find all images in the cloned document and set crossOrigin
          const images = clonedDoc.getElementsByTagName("img")
          for (let i = 0; i < images.length; i++) {
            images[i].crossOrigin = "anonymous"
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
        pdf.text(`Total Price: $${pricingData.totalPrice.toFixed(2)} ${pricingData.currency}`, 20, 50)
        pdf.text(`Simple Pricing: ${simplePricing || "Not available"}`, 20, 60)
        pdf.text("Note: This is a simplified report due to rendering issues.", 20, 70)

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

            {/* Simple Pricing from API */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-3 pb-1 border-b border-gray-200">
                Simple Pricing
              </h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="font-medium text-blue-800 text-xl">
                  {simplePricing || "Pricing information not available"}
                </p>
                <p className="text-gray-600 mt-2 text-sm">
                  This pricing information was fetched directly from the pricing API.
                </p>
              </div>
            </div>

            {/* Selected Items Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-3 pb-1 border-b border-gray-200">
                Selected Content
              </h3>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedItems.filter((item) => item.type === "image").length} Images
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedItems.filter((item) => item.type === "message").length} Messages
                </div>
              </div>

              {/* Preview of selected items - show ALL selected items */}
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <span className="font-medium">{item.type === "image" ? "Image" : "Message"}</span>
                      <span>•</span>
                      <span>{format(new Date(item.timestamp), "MMM d, h:mm a")}</span>
                    </div>

                    {item.type === "message" && (
                      <div className="bg-white p-3 rounded border border-gray-100">
                        <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                      </div>
                    )}

                    {item.type === "image" && item.image && (
                      <div className="mt-2">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt="Selected content"
                          className="max-h-64 max-w-full object-contain border border-gray-200 rounded bg-white p-1"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-green-700 mb-3 pb-1 border-b border-gray-200">
                Detailed Pricing Information
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="text-left p-3 border border-gray-200 font-medium">Item</th>
                      <th className="text-left p-3 border border-gray-200 font-medium">Description</th>
                      <th className="text-right p-3 border border-gray-200 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-gray-200">Base Greening Service</td>
                      <td className="p-3 border border-gray-200">Standard eco-transformation</td>
                      <td className="text-right p-3 border border-gray-200 font-medium">
                        ${pricingData.basePrice.toFixed(2)} {pricingData.currency}
                      </td>
                    </tr>
                    {pricingData.additionalCosts.map((cost, index) => (
                      <tr key={index}>
                        <td className="p-3 border border-gray-200">{cost.name}</td>
                        <td className="p-3 border border-gray-200">{cost.description}</td>
                        <td className="text-right p-3 border border-gray-200 font-medium">
                          ${cost.price.toFixed(2)} {pricingData.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50">
                      <td colSpan={2} className="p-3 border border-gray-200 font-bold">
                        Total
                      </td>
                      <td className="text-right p-3 border border-gray-200 font-bold">
                        ${pricingData.totalPrice.toFixed(2)} {pricingData.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Estimated Timeframe:</span> {pricingData.estimatedTimeframe}
                </p>
                <p className="text-sm text-gray-500 italic">{pricingData.notes}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Greenly - All rights reserved</p>
              <p className="mt-1">Creating eco-friendly solutions for a sustainable future</p>
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
