import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    name: 'Starter',
    price: 29,
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Pro',
    price: 99,
  },
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  planId: 'starter' | 'pro',
  stripeCustomerId?: string
) {
  const plan = STRIPE_PLANS[planId]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?canceled=true`,
    metadata: { userId, planId },
    subscription_data: {
      metadata: { userId, planId },
    },
  }

  if (stripeCustomerId) {
    params.customer = stripeCustomerId
  } else {
    params.customer_email = email
  }

  return stripe.checkout.sessions.create(params)
}

export async function createBillingPortalSession(stripeCustomerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`,
  })
}
