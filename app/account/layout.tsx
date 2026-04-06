import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/providers/DashboardLayoutClient'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <DashboardLayoutClient
      user={{
        name: session.user.name,
        email: session.user.email,
        plan: session.user.plan || 'free',
      }}
    >
      {children}
    </DashboardLayoutClient>
  )
}
