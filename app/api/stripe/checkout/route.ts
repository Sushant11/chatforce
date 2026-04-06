import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createCheckoutSession } from '@/lib/stripe'
import { stripeCheckoutSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = stripeCheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', session.user.id)
    .single()

  const checkoutSession = await createCheckoutSession(
    session.user.id,
    session.user.email,
    parsed.data.planId,
    user?.stripe_customer_id
  )

  return NextResponse.json({ checkoutUrl: checkoutSession.url })
}
