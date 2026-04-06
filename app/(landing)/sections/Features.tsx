import { FileText, Smile, Shield, Rocket, BarChart3, Code2 } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Upload Your Docs',
    description:
      'Drop PDFs, Word docs, CSVs, or plain text files. We extract the knowledge and power your chatbot with it.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Smile,
    title: 'Pick a Personality',
    description:
      'Choose from Professional, Casual, Technical, or Friendly. Set the tone to match your brand perfectly.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Shield,
    title: 'Set Safety Rules',
    description:
      "Block medical or financial advice, restrict to your domain, require source citations, and more. You're in control.",
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Rocket,
    title: 'Deploy Instantly',
    description:
      'Embed on any website with 2 lines of HTML, or integrate via our REST API. Zero infrastructure required.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Built-in Analytics',
    description:
      'Track messages, tokens, top questions, and document usage. Understand how users interact with your chatbot.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Code2,
    title: 'API Access',
    description:
      'Full REST API with API key authentication. Integrate ChatforceAI into your own products and workflows.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
]

export default function Features() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything you need to build a world-class chatbot
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From document upload to production deployment, we handle the hard parts so you can focus on your customers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
