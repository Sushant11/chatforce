'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, LayoutDashboard, MessageSquare, Plus, Settings, CreditCard, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chatbots', label: 'My Chatbots', icon: MessageSquare },
  { href: '/chatbots/new', label: 'Create New', icon: Plus },
  { href: '/account', label: 'Account', icon: Settings },
  { href: '/account/billing', label: 'Billing', icon: CreditCard },
]

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
}

export default function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200',
          'lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Bot className="h-4 w-4" />
            </div>
            ChatforceAI
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800">
          <p className="text-xs text-slate-600 text-center">Powered by Claude AI</p>
        </div>
      </aside>
    </>
  )
}
