"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Sparkles, Zap, Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to Premium",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // In a real implementation, you would:
      // 1. Create a Stripe Checkout session
      // 2. Redirect to Stripe Checkout
      // For demo purposes, we'll simulate the process

      toast({
        title: "Redirecting to Stripe...",
        description: "You'll be redirected to complete your payment",
      })

      // Simulate redirect delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, this would redirect to Stripe Checkout
      // window.location.href = checkoutUrl

      toast({
        title: "Demo Mode",
        description: "This is a demo. In production, you'd be redirected to Stripe Checkout.",
      })
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Error",
        description: "Failed to start subscription process",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Unlimited Green It Transformations",
      description: "Transform unlimited images into eco-friendly versions",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Advanced Image Editing",
      description: "Access to premium filters and editing tools",
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Priority Processing",
      description: "Faster image processing and generation",
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: "Premium Templates",
      description: "Access to exclusive eco-friendly templates",
    },
    {
      icon: <Check className="w-5 h-5" />,
      title: "Advanced Reports",
      description: "Detailed analytics and custom PDF reports",
    },
    {
      icon: <Check className="w-5 h-5" />,
      title: "Priority Support",
      description: "24/7 premium customer support",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container px-4 mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-green-500 rounded-full"></div>
            <h1 className="text-xl font-bold text-green-700">Greenly</h1>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Chat</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12 mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            Premium Subscription
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Unlock the Full Power of Greenly</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your eco-friendly projects with unlimited access to premium features, advanced tools, and priority
            support.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="relative overflow-hidden border-2 border-green-200 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Most Popular</Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Premium Plan</CardTitle>
              <CardDescription className="text-gray-600">
                Everything you need for professional eco-friendly projects
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-green-600">$20</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-6">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Subscribe to Premium
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:border-green-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-3">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to premium features
                until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and digital wallets through Stripe's secure payment
                processing.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                New users get access to basic features for free. Premium features require a subscription, but you can
                cancel anytime if you're not satisfied.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How does billing work?</h3>
              <p className="text-gray-600">
                You'll be billed monthly at $20/month. Your subscription will automatically renew unless you cancel
                before your next billing date.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">Trusted by eco-conscious creators worldwide</p>
          <div className="flex justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container px-4 mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Greenly. All rights reserved.</p>
          <p className="mt-2">Powered by Stripe for secure payments</p>
        </div>
      </footer>
    </div>
  )
}
