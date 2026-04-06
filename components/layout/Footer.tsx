import Link from 'next/link'
import { Bot } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <Bot className="h-3.5 w-3.5" />
            </div>
            ChatforceAI
          </Link>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="mailto:support@chatforceai.com" className="hover:text-slate-300 transition-colors">Support</Link>
          </div>
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} ChatforceAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
