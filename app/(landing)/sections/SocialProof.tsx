import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Customer Success',
    company: 'Meridian SaaS',
    avatar: 'SC',
    quote:
      "We uploaded our entire help center and had a working chatbot in 20 minutes. Response accuracy went from 60% to 94%. Our support ticket volume dropped 40% in the first week.",
    rating: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Founder & CEO',
    company: 'ShopNest',
    avatar: 'MR',
    quote:
      "The personality customization is incredible. Our chatbot sounds exactly like our brand – casual, fun, but helpful. Customers genuinely can't tell it's AI at first.",
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'HR Operations Manager',
    company: 'BuildCo',
    avatar: 'EW',
    quote:
      "We uploaded our employee handbook and benefits docs. New hires ask HR questions to the chatbot instead of emailing us. The 'stay in domain' safety rule is a lifesaver.",
    rating: 5,
  },
  {
    name: 'James Park',
    role: 'CTO',
    company: 'DevHive',
    avatar: 'JP',
    quote:
      "The API is clean and well-documented. We integrated ChatforceAI into our product in an afternoon. The RAG quality is genuinely impressive compared to what we were building ourselves.",
    rating: 5,
  },
]

export default function SocialProof() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Loved by teams who care about customer experience
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Join 500+ businesses using ChatforceAI to delight their customers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
