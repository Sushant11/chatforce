import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ChatPreview from '@/components/chatbot/ChatPreview'
import DocumentManager from '@/components/chatbot/DocumentManager'
import CustomizePanel from '@/components/chatbot/CustomizePanel'
import DeployPanel from '@/components/chatbot/DeployPanel'
import type { Chatbot, Document } from '@/types'
import { Badge } from '@/components/ui/badge'

interface ChatbotPageProps {
  params: { id: string }
}

export default async function ChatbotPage({ params }: ChatbotPageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: chatbot } = await supabaseAdmin
    .from('chatbots')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (!chatbot) notFound()

  const { data: documents } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('chatbot_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{chatbot.name}</h1>
          <Badge
            variant="outline"
            className={
              chatbot.status === 'published'
                ? 'border-green-700 text-green-400'
                : 'border-amber-700 text-amber-400'
            }
          >
            {chatbot.status}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left: Tabs */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="documents">
            <TabsList className="bg-slate-900 border border-slate-800 w-full sm:w-auto">
              <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">Documents</TabsTrigger>
              <TabsTrigger value="customize" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">Customize</TabsTrigger>
              <TabsTrigger value="deploy" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">Deploy</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-4">
              <DocumentManager chatbotId={chatbot.id} initialDocuments={documents ?? []} />
            </TabsContent>

            <TabsContent value="customize" className="mt-4">
              <CustomizePanel chatbot={chatbot as Chatbot} />
            </TabsContent>

            <TabsContent value="deploy" className="mt-4">
              <DeployPanel chatbot={chatbot as Chatbot} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Live Preview */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Live Preview</p>
          <ChatPreview chatbot={chatbot as Chatbot} documents={documents as Document[] ?? []} />
        </div>
      </div>
    </div>
  )
}
