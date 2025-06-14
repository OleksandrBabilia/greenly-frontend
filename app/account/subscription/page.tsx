"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Crown, Loader2, AlertTriangle } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { PREMIUM_SUBSCRIPTION } from "@/utils/stripe-config"

export default function SubscriptionPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { tier, status, isLoading, features, refreshSubscription } = useSubscription()
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>You need to be logged in to manage your subscription.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="mr-2">
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
      )
    ) {
      return
    }

    try {
      setIsCanceling(true)
      setCancelError(null)

      // Call the API to cancel the subscription
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      // Refresh subscription data
      await refreshSubscription()
    } catch (error) {
      console.error("Error canceling subscription:", error)
      setCancelError("Failed to cancel subscription. Please try again or contact support.")
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 flex justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading subscription information...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Plan */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your current subscription plan and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
                    tier === "premium" ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gray-100"
                  }`}
                >
                  {tier === "premium" ? (
                    <Crown className="h-8 w-8 text-white" />
                  ) : (
                    <span className="text-gray-500 text-lg font-medium">Free</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{tier === "premium" ? "Premium Plan" : "Free Plan"}</h3>
                  <p className="text-gray-500">
                    {tier === "premium" ? `Status: ${status === "active" ? "Active" : status}` : "Basic features only"}
                  </p>
                </div>
              </div>

              <h4 className="font-medium mb-3">Included Features:</h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier === "premium" ? (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling || status === "canceled"}
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  {isCanceling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Canceling...
                    </>
                  ) : status === "canceled" ? (
                    "Subscription Canceled"
                  ) : (
                    "Cancel Subscription"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/?upgrade=true")}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Upgrade to Premium
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Error Message */}
          {cancelError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{cancelError}</p>
            </div>
          )}

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Comparison</CardTitle>
              <CardDescription>Compare available subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">Free Plan</h3>
                  <p className="text-2xl font-bold mb-4">
                    $0 <span className="text-sm font-normal text-gray-500">/month</span>
                  </p>
                  <Separator className="my-4" />
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Basic image processing</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Standard eco-friendly filters</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Community support</span>
                    </li>
                  </ul>
                  {tier === "free" ? (
                    <Button disabled className="w-full bg-gray-100 text-gray-500 cursor-not-allowed">
                      Current Plan
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Downgrade
                    </Button>
                  )}
                </div>

                {/* Premium Plan */}
                <div className="border rounded-lg p-6 border-green-200 bg-green-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">Premium Plan</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-4">
                    ${PREMIUM_SUBSCRIPTION.price}{" "}
                    <span className="text-sm font-normal text-gray-500">/{PREMIUM_SUBSCRIPTION.interval}</span>
                  </p>
                  <Separator className="my-4" />
                  <ul className="space-y-2 mb-6">
                    {PREMIUM_SUBSCRIPTION.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier === "premium" ? (
                    <Button disabled className="w-full bg-gray-100 text-gray-500 cursor-not-allowed">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push("/?upgrade=true")}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      Upgrade Now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
