import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, MessageSquare, Bot, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Chatbot } from '@/types'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: chatbots } = await supabaseAdmin
    .from('chatbots')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const { count: totalMessages } = await supabaseAdmin
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('chatbot_id', (chatbots ?? []).map((c: Chatbot) => c.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, {session.user.name?.split(' ')[0] || 'there'}
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-500">
          <Link href="/chatbots/new">
            <Plus className="mr-2 h-4 w-4" />
            New Chatbot
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10">
              <Bot className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{chatbots?.length ?? 0}</p>
              <p className="text-xs text-slate-400">Total Chatbots</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600/10">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalMessages ?? 0}</p>
              <p className="text-xs text-slate-400">Total Messages</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10">
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white capitalize">{session.user.plan}</p>
              <p className="text-xs text-slate-400">Current Plan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chatbots */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Chatbots</h2>
        {!chatbots || chatbots.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Bot className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Create your first chatbot</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                Upload your documents and have an AI chatbot ready in minutes.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-500">
                <Link href="/chatbots/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Chatbot
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatbots.map((chatbot: Chatbot) => (
              <Card key={chatbot.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
                      <Bot className="h-5 w-5 text-blue-400" />
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        chatbot.status === 'published'
                          ? 'border-green-700 text-green-400'
                          : 'border-slate-700 text-slate-400'
                      }
                    >
                      {chatbot.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-base mt-3">{chatbot.name}</CardTitle>
                  <CardDescription className="text-slate-400 text-xs line-clamp-2">
                    {chatbot.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-slate-600 mb-4">Created {formatDate(chatbot.created_at)}</p>
                  <Button asChild size="sm" variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Link href={`/chatbots/${chatbot.id}`}>Open Builder</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
