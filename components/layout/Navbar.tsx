import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Bot className="h-4 w-4" />
          </div>
          ChatforceAI
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hidden sm:flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
