import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-violet-700">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to build your first chatbot?
        </h2>
        <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
          Upload your docs, customize your chatbot, and go live — in under 30 minutes. Free forever for your first
          100 conversations.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50 h-12 px-8 text-base font-semibold">
            <Link href="/signup">
              Start Building Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base"
          >
            <Link href="#pricing">View Pricing</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-blue-200">No credit card required · Setup in 5 minutes · Cancel anytime</p>
      </div>
    </section>
  )
}
