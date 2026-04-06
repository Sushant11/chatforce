import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, MessageSquare, Send } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Claude AI
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
              Turn Your Docs Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                Intelligent Chatbots
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-300 max-w-xl mx-auto lg:mx-0">
              Upload your documents, pick a personality, set safety rules, and deploy a fully customized AI chatbot
              in minutes. No code required.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 text-base">
                <Link href="/signup">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white h-12 px-8 text-base"
              >
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-slate-500">No credit card required · Free tier available</p>
          </div>

          {/* Right: Mock Chat Widget */}
          <div className="flex-shrink-0 w-full max-w-sm">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 backdrop-blur shadow-2xl overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-3 bg-blue-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Support Assistant</p>
                  <p className="text-xs text-blue-200">Online · Powered by ChatforceAI</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[220px]">
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-700 px-3.5 py-2.5 text-sm text-slate-100">
                    Hi! How can I help you today?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-600 px-3.5 py-2.5 text-sm text-white">
                    What&apos;s your refund policy?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-700 px-3.5 py-2.5 text-sm text-slate-100">
                    We offer a 30-day money-back guarantee. Simply contact support and we&apos;ll process your refund
                    within 3–5 business days. <span className="text-blue-400 text-xs">[Source: Refund Policy.pdf]</span>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-slate-700 p-3 flex items-center gap-2">
                <input
                  className="flex-1 bg-slate-800 rounded-full px-4 py-2 text-sm text-slate-300 placeholder-slate-500 outline-none border border-slate-600"
                  placeholder="Ask me anything..."
                  readOnly
                />
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4 border-t border-slate-700 pt-12">
          {[
            { value: '500+', label: 'Businesses using ChatforceAI' },
            { value: '2M+', label: 'Messages processed' },
            { value: '<2s', label: 'Average response time' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
