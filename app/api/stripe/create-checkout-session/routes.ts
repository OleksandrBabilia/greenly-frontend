import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { PREMIUM_SUBSCRIPTION } from "@/utils/stripe-config"

export async function POST(req: Request) {
  try {
    const { user_id, user_email, subscription_type } = await req.json()

    if (!user_id || !user_email) {
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 })
    }

    console.log("Creating Stripe checkout session:")
    console.log(`- User ID: ${user_id}`)
    console.log(`- User Email: ${user_email}`)
    console.log(`- Subscription Type: ${subscription_type}`)

    // Create a new Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      customer_email: user_email,
      line_items: [
        {
          price_data: {
            currency: PREMIUM_SUBSCRIPTION.currency.toLowerCase(),
            product_data: {
              name: PREMIUM_SUBSCRIPTION.name,
              description: `${PREMIUM_SUBSCRIPTION.features.length} premium features included`,
              metadata: {
                subscription_type,
              },
            },
            unit_amount: Math.round(PREMIUM_SUBSCRIPTION.price * 100), // Convert to cents
            recurring: {
              interval: PREMIUM_SUBSCRIPTION.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription/cancel`,
      metadata: {
        user_id,
        subscription_type,
      },
    })

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
      },
      { status: 500 },
    )
  }
}
