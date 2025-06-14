// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51234567890abcdef"
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_51234567890abcdef"

// Subscription configuration
export const PREMIUM_SUBSCRIPTION = {
  name: "Greenly Premium",
  price: 20.0,
  currency: "USD",
  interval: "month",
  features: [
    "Unlimited image processing",
    "Advanced eco-friendly filters",
    "Priority support",
    "Export to multiple formats",
    "Custom branding removal",
    "Advanced analytics",
  ],
}
