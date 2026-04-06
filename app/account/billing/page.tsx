import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PLAN_LIMITS, PLAN_PRICES } from '@/types'
import { formatDate } from '@/lib/utils'
import UpgradeButton from '@/components/billing/UpgradeButton'
import BillingPortalButton from '@/components/billing/BillingPortalButton'
import type { Plan } from '@/types'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const plan = (session.user.plan || 'free') as Plan
  const limits = PLAN_LIMITS[plan]

  // Get this month's message count
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: messagesThisMonth } = await supabaseAdmin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('event_type', 'message')
    .gte('created_at', startOfMonth.toISOString())

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single()

  const usageCount = messagesThisMonth ?? 0
  const maxMessages = limits.messages_per_month
  const usagePct = maxMessages === Infinity ? 0 : Math.min((usageCount / maxMessages) * 100, 100)

  const planDisplayNames: Record<Plan, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your subscription and usage</p>
      </div>

      {/* Current Plan */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base">Current Plan</CardTitle>
            <Badge className="bg-blue-600 text-white capitalize">{planDisplayNames[plan]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {PLAN_PRICES[plan] === 0 ? 'Free' : `$${PLAN_PRICES[plan]}`}
            </span>
            {PLAN_PRICES[plan] > 0 && <span className="text-slate-400 text-sm">/month</span>}
          </div>

          {subscription?.current_period_end && (
            <p className="text-xs text-slate-500">
              Renews {formatDate(subscription.current_period_end)}
            </p>
          )}

          {/* Usage */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Messages this month</span>
              <span>
                {usageCount.toLocaleString()} / {maxMessages === Infinity ? 'Unlimited' : maxMessages.toLocaleString()}
              </span>
            </div>
            {maxMessages !== Infinity && (
              <Progress value={usagePct} className="h-2" />
            )}
            {usagePct >= 80 && maxMessages !== Infinity && (
              <p className="text-xs text-amber-400 mt-1">⚠ You&apos;re at {Math.round(usagePct)}% of your limit</p>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {plan !== 'pro' && plan !== 'enterprise' && (
              <UpgradeButton currentPlan={plan} />
            )}
            {plan !== 'free' && <BillingPortalButton />}
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Plan Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Chatbots', value: limits.chatbots === Infinity ? 'Unlimited' : limits.chatbots },
              {
                label: 'Messages/month',
                value: limits.messages_per_month === Infinity ? 'Unlimited' : limits.messages_per_month.toLocaleString(),
              },
              {
                label: 'Document storage',
                value: limits.storage_mb === Infinity ? 'Unlimited' : `${limits.storage_mb >= 1024 ? `${limits.storage_mb / 1024} GB` : `${limits.storage_mb} MB`}`,
              },
              { label: 'API access', value: limits.api_access ? '✓' : '✗' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-slate-800 last:border-0">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-sm text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
