'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Copy, Eye, EyeOff, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getEmbedCode } from '@/lib/utils'
import type { Chatbot } from '@/types'

interface DeployPanelProps {
  chatbot: Chatbot
}

export default function DeployPanel({ chatbot }: DeployPanelProps) {
  const [status, setStatus] = useState(chatbot.status)
  const [apiKey, setApiKey] = useState(chatbot.api_key || '')
  const [showKey, setShowKey] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [generatingKey, setGeneratingKey] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const embedCode = getEmbedCode(chatbot.id, chatbot.primary_color)

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  const togglePublish = async () => {
    setTogglingStatus(true)
    const newStatus = status === 'published' ? 'draft' : 'published'
    try {
      await api.patch(`/chatbots/${chatbot.id}`, { status: newStatus })
      setStatus(newStatus)
      toast.success(newStatus === 'published' ? 'Chatbot published!' : 'Chatbot unpublished')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setTogglingStatus(false)
    }
  }

  const generateApiKey = async () => {
    setGeneratingKey(true)
    try {
      const res = await api.post(`/chatbots/${chatbot.id}/api-key`)
      setApiKey(res.data.apiKey)
      toast.success('New API key generated')
    } catch {
      toast.error('Failed to generate API key')
    } finally {
      setGeneratingKey(false)
    }
  }

  const maskedKey = apiKey ? `cfai_${'•'.repeat(28)}${apiKey.slice(-4)}` : ''

  return (
    <div className="space-y-5">
      {/* Publish toggle */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-base">Publish Status</CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Published chatbots can be embedded and accessed via API
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={status === 'published' ? 'border-green-700 text-green-400' : 'border-amber-700 text-amber-400'}
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Switch
              checked={status === 'published'}
              onCheckedChange={togglePublish}
              disabled={togglingStatus}
            />
            <span className="text-sm text-slate-300">
              {status === 'published' ? 'Live and accessible' : 'Draft – not publicly accessible'}
            </span>
            {togglingStatus && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
        </CardContent>
      </Card>

      {/* Embed code */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Embed Code</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Add these 2 lines to your website to embed your chatbot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
              {embedCode}
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 text-slate-400 hover:text-white h-7"
              onClick={() => copyToClipboard(embedCode, 'embed')}
            >
              {copied === 'embed' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">API Access</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Use your API key to integrate via REST API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKey ? (
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs">API Key</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={showKey ? apiKey : maskedKey}
                  className="bg-slate-800 border-slate-700 text-slate-300 font-mono text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-400 hover:text-white flex-shrink-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-400 hover:text-white flex-shrink-0"
                  onClick={() => copyToClipboard(apiKey, 'apikey')}
                >
                  {copied === 'apikey' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No API key generated yet.</p>
          )}

          <Button
            onClick={generateApiKey}
            disabled={generatingKey}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {generatingKey ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            {apiKey ? 'Regenerate Key' : 'Generate API Key'}
          </Button>

          {apiKey && (
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-4">
              <p className="text-xs text-slate-400 font-medium mb-2">Example request:</p>
              <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap overflow-x-auto">
                {`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || 'https://chatforceai.com'}/api/v1/chat \\
  -H "Authorization: Bearer ${showKey ? apiKey : 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello", "sessionId": "session-123"}'`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chatbot Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Chatbot ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              readOnly
              value={chatbot.id}
              className="bg-slate-800 border-slate-700 text-slate-400 font-mono text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-400 hover:text-white flex-shrink-0"
              onClick={() => copyToClipboard(chatbot.id, 'id')}
            >
              {copied === 'id' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
