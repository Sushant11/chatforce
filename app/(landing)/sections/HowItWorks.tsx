import { Upload, Settings, Globe, MessageCircle } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Documents',
    description:
      'Upload PDFs, text files, or CSVs containing your knowledge base. We parse and index everything automatically.',
    color: 'text-blue-600',
    bg: 'bg-blue-600',
  },
  {
    step: '02',
    icon: Settings,
    title: 'Customize Everything',
    description:
      'Set your personality, tone, response format, and safety rules. Fine-tune the system prompt if you want full control.',
    color: 'text-violet-600',
    bg: 'bg-violet-600',
  },
  {
    step: '03',
    icon: Globe,
    title: 'Deploy to Your Site',
    description:
      "Copy two lines of embed code to your website, or use our API. Your chatbot is live in under 5 minutes.",
    color: 'text-green-600',
    bg: 'bg-green-600',
  },
  {
    step: '04',
    icon: MessageCircle,
    title: 'Start Chatting',
    description:
      'Your visitors get instant, accurate answers. Track every conversation in your analytics dashboard.',
    color: 'text-orange-600',
    bg: 'bg-orange-600',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            From zero to chatbot in 4 steps
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            No coding, no infrastructure setup, no ML expertise needed. Just follow the steps.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-[calc(100%-200px)] h-0.5 bg-gradient-to-r from-blue-600 via-violet-600 via-green-600 to-orange-600 opacity-20" />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="relative text-center">
                  <div className="relative inline-flex">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} text-white shadow-lg`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold border border-white dark:border-slate-900">
                      {step.step.slice(-1)}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
