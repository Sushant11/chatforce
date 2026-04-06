import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { supabaseAdmin } from '@/lib/supabase'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Name</p>
              <p className="text-sm text-slate-200">{session.user.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Email</p>
              <p className="text-sm text-slate-200">{session.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Auth Provider</p>
              <p className="text-sm text-slate-200 capitalize">{user?.auth_provider || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Member Since</p>
              <p className="text-sm text-slate-200">{user ? formatDate(user.created_at) : '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Plan & Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Badge className="capitalize bg-blue-600 text-white">{session.user.plan}</Badge>
          <Badge variant="outline" className="border-green-700 text-green-400 capitalize">
            {user?.status || 'active'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
