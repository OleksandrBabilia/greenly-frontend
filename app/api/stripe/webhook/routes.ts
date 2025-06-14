import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { headers } from "next/headers"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature") as string

  let event

  try {
    // Verify the webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.warn("Missing Stripe webhook secret")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 })
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        // Extract the user ID from the metadata
        const userId = session.metadata?.user_id
        const subscriptionType = session.metadata?.subscription_type

        if (userId && subscriptionType) {
          console.log(`User ${userId} subscribed to ${subscriptionType}`)

          // In a real implementation, you would:
          // 1. Update the user's subscription status in your database
          // 2. Grant access to premium features
          // 3. Send a confirmation email

          // For this demo, we'll just log the event
          console.log("Subscription successful:", {
            userId,
            subscriptionType,
            sessionId: session.id,
            customerId: session.customer,
            subscriptionId: session.subscription,
          })
        }
        break

      case "customer.subscription.updated":
        const subscription = event.data.object
        console.log("Subscription updated:", subscription.id)
        // Handle subscription updates (e.g., plan changes, payment method updates)
        break

      case "customer.subscription.deleted":
        const canceledSubscription = event.data.object
        console.log("Subscription canceled:", canceledSubscription.id)
        // Handle subscription cancellations
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook event:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Disable body parsing for this route as we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
