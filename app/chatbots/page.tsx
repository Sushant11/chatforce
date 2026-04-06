import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Bot } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Chatbot } from '@/types'
import DeleteChatbotButton from '@/components/chatbot/DeleteChatbotButton'

export default async function ChatbotsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: chatbots } = await supabaseAdmin
    .from('chatbots')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Chatbots</h1>
          <p className="text-slate-400 text-sm mt-1">{chatbots?.length ?? 0} chatbot{chatbots?.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-500">
          <Link href="/chatbots/new">
            <Plus className="mr-2 h-4 w-4" />
            New Chatbot
          </Link>
        </Button>
      </div>

      {!chatbots || chatbots.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bot className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No chatbots yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Create your first chatbot to start building your AI-powered customer experience.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-500">
              <Link href="/chatbots/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Chatbot
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {chatbots.map((chatbot: Chatbot) => (
            <Card key={chatbot.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors flex flex-col">
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
                        : chatbot.status === 'archived'
                        ? 'border-slate-700 text-slate-500'
                        : 'border-amber-700 text-amber-400'
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
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                <p className="text-xs text-slate-600 mb-4">Created {formatDate(chatbot.created_at)}</p>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                    <Link href={`/chatbots/${chatbot.id}`}>Open</Link>
                  </Button>
                  <DeleteChatbotButton chatbotId={chatbot.id} chatbotName={chatbot.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
