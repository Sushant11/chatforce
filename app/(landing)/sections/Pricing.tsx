import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Try it out. No credit card needed.',
    features: [
      '1 chatbot',
      '100 messages/month',
      '50 MB document storage',
      'Embed widget',
      'Basic analytics',
    ],
    cta: 'Get Started Free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: 29,
    description: 'For small teams and growing businesses.',
    features: [
      '2 chatbots',
      '10,000 messages/month',
      '1 GB document storage',
      'API access',
      'Full analytics dashboard',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=starter',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: 99,
    description: 'For companies that need scale and customization.',
    features: [
      '10 chatbots',
      '100,000 messages/month',
      '10 GB document storage',
      'API access',
      'Custom domain embedding',
      'Advanced safety rules',
      'CSV export',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'Custom pricing for large organizations.',
    features: [
      'Unlimited chatbots',
      'Unlimited messages',
      'Unlimited storage',
      'Dedicated infrastructure',
      'SLA guarantee',
      'SSO & team management',
      'Custom model fine-tuning',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    href: 'mailto:sales@chatforceai.com',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-blue-600 bg-blue-600 text-white shadow-2xl scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-1 text-xs font-semibold text-white shadow">
                  Most Popular
                </div>
              )}

              <div>
                <h3
                  className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}
                >
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  {plan.price !== null ? (
                    <>
                      <span
                        className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}
                      >
                        ${plan.price}
                      </span>
                      <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>/mo</span>
                    </>
                  ) : (
                    <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      Custom
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? 'text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-blue-200' : 'text-blue-600'}`}
                    />
                    <span
                      className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-8 w-full ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
