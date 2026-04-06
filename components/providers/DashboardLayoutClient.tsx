'use client'

import { useState } from 'react'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import DashboardNavbar from '@/components/layout/DashboardNavbar'

interface DashboardLayoutClientProps {
  user: { name?: string | null; email: string; plan: string }
  children: React.ReactNode
}

export default function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
