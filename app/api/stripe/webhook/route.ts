import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId

        if (userId && planId && session.customer) {
          await supabaseAdmin
            .from('users')
            .update({
              plan: planId,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: session.subscription as string,
            plan: planId,
            status: 'active',
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        const status = event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status

        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscription.id)

          if (status === 'canceled') {
            await supabaseAdmin
              .from('users')
              .update({ plan: 'free', updated_at: new Date().toISOString() })
              .eq('id', userId)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subId = invoice.subscription
        if (subId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId as string)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
