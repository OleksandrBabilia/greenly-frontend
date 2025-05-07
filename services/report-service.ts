import { convertToNipIo } from "@/utils/nip-io"
import { getApiUrl } from "@/utils/api-config"

// Type for pricing schema request
type PricingSchemaRequest = {
  originalImage: string
  resourceName: string
  resourceDescription: string
  userId?: string
}

// Type for pricing schema response
type PricingSchemaResponse = {
  success: boolean
  pricingSchema: {
    basePrice: number
    additionalCosts: Array<{
      name: string
      price: number
      description: string
    }>
    totalPrice: number
    currency: string
    notes: string
    estimatedTimeframe: string
  }
  simplePricing?: string
  error?: string
}

// Function to get pricing schema from the server
export async function getPricingSchema(request: PricingSchemaRequest): Promise<PricingSchemaResponse> {
  try {
    // Prepare the request body
    const requestBody = {
      original_image: request.originalImage,
      resource_name: request.resourceName,
      resource_description: request.resourceDescription,
      user_id: request.userId,
    }

    // Send the request to the server
    const pricingUrl = convertToNipIo(getApiUrl("pricing/schema"))
    const response = await fetch(pricingUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Also fetch the simple pricing from the new endpoint
    const simplePricingUrl = convertToNipIo(getApiUrl("pricing"))
    const simplePricingResponse = await fetch(simplePricingUrl)
    const simplePricingData = await simplePricingResponse.json()

    // Transform the API response to our expected format
    const pricingSchema = {
      basePrice: data.pricing_schema?.basePrice || 0,
      additionalCosts: data.pricing_schema?.additionalCosts || [],
      totalPrice: data.pricing_schema?.totalPrice || 0,
      currency: data.pricing_schema?.currency || "USD",
      notes: data.pricing_schema?.notes || "",
      estimatedTimeframe: data.pricing_schema?.estimatedTimeframe || "",
    }

    return {
      success: true,
      pricingSchema,
      simplePricing: simplePricingData.pricing_schema,
    }
  } catch (error) {
    console.error("Error getting pricing schema:", error)
    return {
      success: false,
      pricingSchema: {
        basePrice: 0,
        additionalCosts: [],
        totalPrice: 0,
        currency: "USD",
        notes: "",
        estimatedTimeframe: "",
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
