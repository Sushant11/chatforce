'use client'

import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from 'next-auth/react'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

interface DashboardNavbarProps {
  user: { name?: string | null; email: string; plan: string }
  onMenuClick: () => void
}

export default function DashboardNavbar({ user, onMenuClick }: DashboardNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-slate-400 hover:text-white"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center rounded-full bg-blue-600/10 border border-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-400 capitalize">
          {user.plan} plan
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 bg-slate-900 border-slate-700" align="end">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-white">{user.name || 'Account'}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem asChild className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800 cursor-pointer">
              <Link href="/account">Account Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-800 cursor-pointer">
              <Link href="/account/billing">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-800 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
