"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Calculator, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GreeningElement {
  id: string
  name: string
  unit: string
  quantity: number
  pricePerUnit: number
  total: number
  isCustom: boolean
}

interface PricingCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (elements: GreeningElement[], totalPrice: number) => Promise<void>
  resourceName: string
  resourceDescription: string
}

const DEFAULT_ELEMENTS: Omit<GreeningElement, "id" | "total">[] = [
  { name: "Grass (Square Feet)", unit: "sq ft", quantity: 0, pricePerUnit: 2.5, isCustom: false },
  { name: "Trees", unit: "each", quantity: 0, pricePerUnit: 125.0, isCustom: false },
  { name: "Bushes/Shrubs", unit: "each", quantity: 0, pricePerUnit: 35.0, isCustom: false },
  { name: "Flower Beds", unit: "sq ft", quantity: 0, pricePerUnit: 8.0, isCustom: false },
  { name: "Mulch", unit: "cubic yards", quantity: 0, pricePerUnit: 45.0, isCustom: false },
  { name: "Irrigation System", unit: "sq ft", quantity: 0, pricePerUnit: 3.5, isCustom: false },
  { name: "Walkways/Paths", unit: "linear ft", quantity: 0, pricePerUnit: 15.0, isCustom: false },
  { name: "Retaining Walls", unit: "linear ft", quantity: 0, pricePerUnit: 85.0, isCustom: false },
  { name: "Outdoor Lighting", unit: "each", quantity: 0, pricePerUnit: 150.0, isCustom: false },
  { name: "Compost/Soil Amendment", unit: "cubic yards", quantity: 0, pricePerUnit: 55.0, isCustom: false },
]

export function PricingCalculatorModal({
  isOpen,
  onClose,
  onSubmit,
  resourceName,
  resourceDescription,
}: PricingCalculatorModalProps) {
  const { toast } = useToast()
  const [elements, setElements] = useState<GreeningElement[]>(() =>
    DEFAULT_ELEMENTS.map((element, index) => ({
      ...element,
      id: `default-${index}`,
      total: 0,
    })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newElementName, setNewElementName] = useState("")
  const [newElementUnit, setNewElementUnit] = useState("")
  const [newElementPrice, setNewElementPrice] = useState("")

  // Calculate total for an element
  const calculateElementTotal = (quantity: number, pricePerUnit: number): number => {
    return quantity * pricePerUnit
  }

  // Calculate overall total
  const calculateOverallTotal = (): number => {
    return elements.reduce((sum, element) => sum + element.total, 0)
  }

  // Update element quantity
  const updateElementQuantity = (id: string, quantity: number) => {
    setElements((prev) =>
      prev.map((element) => {
        if (element.id === id) {
          const total = calculateElementTotal(quantity, element.pricePerUnit)
          return { ...element, quantity, total }
        }
        return element
      }),
    )
  }

  // Update element price per unit
  const updateElementPrice = (id: string, pricePerUnit: number) => {
    setElements((prev) =>
      prev.map((element) => {
        if (element.id === id) {
          const total = calculateElementTotal(element.quantity, pricePerUnit)
          return { ...element, pricePerUnit, total }
        }
        return element
      }),
    )
  }

  // Add custom element
  const addCustomElement = () => {
    if (!newElementName.trim() || !newElementUnit.trim() || !newElementPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields for the custom element.",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(newElementPrice)
    if (isNaN(price) || price < 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price.",
        variant: "destructive",
      })
      return
    }

    const newElement: GreeningElement = {
      id: `custom-${Date.now()}`,
      name: newElementName.trim(),
      unit: newElementUnit.trim(),
      quantity: 0,
      pricePerUnit: price,
      total: 0,
      isCustom: true,
    }

    setElements((prev) => [...prev, newElement])
    setNewElementName("")
    setNewElementUnit("")
    setNewElementPrice("")

    toast({
      title: "Element Added",
      description: `${newElement.name} has been added to the pricing calculator.`,
    })
  }

  // Remove custom element
  const removeCustomElement = (id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id))
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Filter out elements with zero quantity
      const activeElements = elements.filter((element) => element.quantity > 0)

      if (activeElements.length === 0) {
        toast({
          title: "No Elements Selected",
          description: "Please add quantities for at least one greening element.",
          variant: "destructive",
        })
        return
      }

      const totalPrice = calculateOverallTotal()

      await onSubmit(activeElements, totalPrice)
      onClose()
    } catch (error) {
      console.error("Error submitting pricing:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit pricing information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = calculateOverallTotal()
  const activeElementsCount = elements.filter((element) => element.quantity > 0).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Greening Elements Pricing Calculator
          </DialogTitle>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Resource:</strong> {resourceName}
            </p>
            {resourceDescription && (
              <p>
                <strong>Description:</strong> {resourceDescription}
              </p>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 py-4">
          {/* Pricing Elements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Greening Elements</h3>

            <div className="grid gap-4">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`p-4 border rounded-lg ${
                    element.quantity > 0 ? "border-green-200 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{element.name}</h4>
                      {element.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomElement(element.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {element.quantity > 0 && (
                      <div className="text-lg font-bold text-green-600">${element.total.toFixed(2)}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`quantity-${element.id}`} className="text-sm">
                        Quantity ({element.unit})
                      </Label>
                      <Input
                        id={`quantity-${element.id}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={element.quantity}
                        onChange={(e) => updateElementQuantity(element.id, Number.parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`price-${element.id}`} className="text-sm">
                        Price per {element.unit} ($)
                      </Label>
                      <Input
                        id={`price-${element.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={element.pricePerUnit}
                        onChange={(e) => updateElementPrice(element.id, Number.parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Total Cost</Label>
                      <div className="mt-1 p-2 bg-gray-50 border rounded-md text-right font-medium">
                        ${element.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add Custom Element */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Add Custom Element</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-dashed border-gray-300 rounded-lg">
              <div>
                <Label htmlFor="newElementName" className="text-sm">
                  Element Name
                </Label>
                <Input
                  id="newElementName"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder="e.g., Solar Panels"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newElementUnit" className="text-sm">
                  Unit
                </Label>
                <Input
                  id="newElementUnit"
                  value={newElementUnit}
                  onChange={(e) => setNewElementUnit(e.target.value)}
                  placeholder="e.g., each, sq ft"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newElementPrice" className="text-sm">
                  Price per Unit ($)
                </Label>
                <Input
                  id="newElementPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newElementPrice}
                  onChange={(e) => setNewElementPrice(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addCustomElement} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Element
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Total Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-800">Pricing Summary</h3>
              <div className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Active Elements:</span>
                <span className="ml-2 font-medium">{activeElementsCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Elements:</span>
                <span className="ml-2 font-medium">{elements.length}</span>
              </div>
            </div>

            {activeElementsCount > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Selected Elements:</h4>
                <div className="space-y-1 text-sm">
                  {elements
                    .filter((element) => element.quantity > 0)
                    .map((element) => (
                      <div key={element.id} className="flex justify-between">
                        <span>
                          {element.name} ({element.quantity} {element.unit})
                        </span>
                        <span className="font-medium">${element.total.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || activeElementsCount === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Generate Report (${totalPrice.toFixed(2)})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
