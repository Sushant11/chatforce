'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot, Loader2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import type { Chatbot, Document } from '@/types'

interface ChatPreviewProps {
  chatbot: Chatbot
  documents: Document[]
}

export default function ChatPreview({ chatbot, documents }: ChatPreviewProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; sources?: string[] }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await api.post(`/chatbots/${chatbot.id}/chat`, {
        message: text,
        conversationId,
      })
      const { message, conversationId: cId, sourceDocuments } = res.data
      if (cId) setConversationId(cId)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: message,
          sources: sourceDocuments?.map((s: { filename: string }) => s.filename),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const hasDocuments = documents.length > 0

  return (
    <div
      className="flex flex-col rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden"
      style={{ height: '520px' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 text-white"
        style={{ backgroundColor: chatbot.primary_color }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">{chatbot.name}</p>
          <p className="text-xs opacity-75">
            {hasDocuments ? `${documents.length} document${documents.length !== 1 ? 's' : ''} loaded` : 'No documents'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {chatbot.welcome_message || `Hi! I'm ${chatbot.name}. How can I help you?`}
            </p>
            {!hasDocuments && (
              <p className="text-slate-600 text-xs mt-2">Upload documents to give me knowledge.</p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                msg.role === 'user'
                  ? 'text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-100 rounded-tl-sm'
              )}
              style={msg.role === 'user' ? { backgroundColor: chatbot.primary_color } : {}}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700 flex flex-wrap gap-1">
                  {msg.sources.map((src) => (
                    <span key={src} className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <FileText className="h-3 w-3" />
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-3 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={chatbot.placeholder_text || 'Ask me anything...'}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 text-sm"
          disabled={loading}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="h-9 w-9 p-0 flex-shrink-0"
          style={{ backgroundColor: chatbot.primary_color }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
