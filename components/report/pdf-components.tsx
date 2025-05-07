"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Image, Font } from "@react-pdf/renderer"

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
})

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Roboto",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#4ade80",
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#166534",
  },
  subtitle: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#166534",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  resourceInfo: {
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#166534",
  },
  resourceDescription: {
    fontSize: 10,
    color: "#4b5563",
    marginTop: 5,
  },
  imageCollection: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  imageItem: {
    width: "30%",
    margin: "1.5%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 100,
    objectFit: "cover",
  },
  messageItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 5,
  },
  messageContent: {
    fontSize: 10,
    color: "#1f2937",
  },
  messageTimestamp: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 5,
    textAlign: "right",
  },
  pricingTable: {
    marginTop: 10,
  },
  pricingRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
  },
  pricingHeader: {
    backgroundColor: "#f0fdf4",
    fontWeight: 700,
  },
  pricingCell: {
    flex: 1,
    fontSize: 10,
    padding: 5,
  },
  pricingCellWide: {
    flex: 2,
    fontSize: 10,
    padding: 5,
  },
  totalRow: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: "#f0fdf4",
    padding: 5,
    borderRadius: 5,
  },
  totalLabel: {
    flex: 3,
    fontSize: 12,
    fontWeight: 700,
    color: "#166534",
  },
  totalValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
    color: "#166534",
    textAlign: "right",
  },
  notes: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 15,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 8,
    color: "#9ca3af",
  },
})

// PDF Document component
const GreeningReport = ({ selectedItems, pricingSchema, resourceName, resourceDescription }) => {
  const today = format(new Date(), "MMMM d, yyyy")
  const reportNumber = `GR-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 10000)}`

  // Filter items by type
  const images = selectedItems.filter((item) => item.type === "image" || item.image)
  const messages = selectedItems.filter((item) => item.type === "message" && !item.image)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Greening Project Report</Text>
              <Text style={styles.subtitle}>
                Report #: {reportNumber} | Date: {today}
              </Text>
            </View>
            {/* Logo placeholder - in a real app, use your actual logo */}
            <Image
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzIyYzU1ZSIvPjxwYXRoIGQ9Ik0zMCA0MEw1MCAyMEw3MCA0MEw3MCA2MEw1MCA4MEwzMCA2MEwzMCA0MFoiIGZpbGw9IiNmMGZkZjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIxMCIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg=="
              style={styles.logo}
            />
          </View>
        </View>

        {/* Resource Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resource Information</Text>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceName}>{resourceName}</Text>
            {resourceDescription && <Text style={styles.resourceDescription}>{resourceDescription}</Text>}
          </View>
        </View>

        {/* Image Collection */}
        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image Collection</Text>
            <View style={styles.imageCollection}>
              {images.map((item, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image src={item.image || "/placeholder.svg"} style={styles.image} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Greening Plan (Messages) */}
        {messages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Greening Plan</Text>
            {messages.map((item, index) => (
              <View key={index} style={styles.messageItem}>
                <Text style={styles.messageContent}>{item.content}</Text>
                <Text style={styles.messageTimestamp}>{format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Information</Text>

          {/* Pricing Table */}
          <View style={styles.pricingTable}>
            {/* Header Row */}
            <View style={[styles.pricingRow, styles.pricingHeader]}>
              <Text style={styles.pricingCellWide}>Item</Text>
              <Text style={styles.pricingCell}>Description</Text>
              <Text style={styles.pricingCell}>Price</Text>
            </View>

            {/* Base Price Row */}
            <View style={styles.pricingRow}>
              <Text style={styles.pricingCellWide}>Base Greening Service</Text>
              <Text style={styles.pricingCell}>Standard eco-transformation</Text>
              <Text style={styles.pricingCell}>
                ${pricingSchema.basePrice.toFixed(2)} {pricingSchema.currency}
              </Text>
            </View>

            {/* Additional Costs Rows */}
            {pricingSchema.additionalCosts.map((cost, index) => (
              <View key={index} style={styles.pricingRow}>
                <Text style={styles.pricingCellWide}>{cost.name}</Text>
                <Text style={styles.pricingCell}>{cost.description}</Text>
                <Text style={styles.pricingCell}>
                  ${cost.price.toFixed(2)} {pricingSchema.currency}
                </Text>
              </View>
            ))}

            {/* Total Row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${pricingSchema.totalPrice.toFixed(2)} {pricingSchema.currency}
              </Text>
            </View>
          </View>

          {/* Timeframe */}
          <Text style={[styles.messageContent, { marginTop: 15 }]}>
            Estimated Timeframe: {pricingSchema.estimatedTimeframe}
          </Text>

          {/* Notes */}
          <Text style={styles.notes}>Note: {pricingSchema.notes}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>This report was generated by Greenly - Your eco-friendly AI assistant</Text>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Greenly. All rights reserved.</Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

export function PDFComponents({ selectedItems, pricingSchema, resourceName, resourceDescription }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-t-2 border-r-2 border-green-600 rounded-full animate-spin mr-2"></div>
        <span className="text-gray-600">Preparing PDF...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-end">
        <PDFDownloadLink
          document={
            <GreeningReport
              selectedItems={selectedItems}
              pricingSchema={pricingSchema}
              resourceName={resourceName}
              resourceDescription={resourceDescription}
            />
          }
          fileName={`greening-report-${format(new Date(), "yyyyMMdd")}.pdf`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          {({ blob, url, loading, error }) => (loading ? "Generating PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </div>

      <div className="flex-1">
        <PDFViewer style={{ width: "100%", height: "100%" }}>
          <GreeningReport
            selectedItems={selectedItems}
            pricingSchema={pricingSchema}
            resourceName={resourceName}
            resourceDescription={resourceDescription}
          />
        </PDFViewer>
      </div>
    </div>
  )
}
