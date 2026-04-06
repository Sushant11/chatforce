'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Chatbot, Personality, Tone, ResponseFormat } from '@/types'
import { cn } from '@/lib/utils'

interface CustomizePanelProps {
  chatbot: Chatbot
}

const personalities: { value: Personality; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Precise, authoritative, business-focused' },
  { value: 'casual', label: 'Casual', description: 'Friendly, relaxed, approachable' },
  { value: 'technical', label: 'Technical', description: 'Detailed, accurate, developer-oriented' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, encouraging, customer-facing' },
]

const tones: { value: Tone; label: string }[] = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'warm', label: 'Warm' },
  { value: 'formal', label: 'Formal' },
  { value: 'conversational', label: 'Conversational' },
]

const formats: { value: ResponseFormat; label: string; example: string }[] = [
  { value: 'prose', label: 'Prose', example: 'Regular paragraphs of text.' },
  { value: 'bullets', label: 'Bullets', example: '• Point 1\n• Point 2' },
  { value: 'markdown', label: 'Markdown', example: '**Bold**, `code`, ## headings' },
  { value: 'json', label: 'JSON', example: '{"answer": "...", "confidence": 0.9}' },
]

export default function CustomizePanel({ chatbot }: CustomizePanelProps) {
  const [personality, setPersonality] = useState<Personality>(chatbot.personality)
  const [tone, setTone] = useState<Tone>(chatbot.tone)
  const [responseFormat, setResponseFormat] = useState<ResponseFormat>(chatbot.response_format)
  const [safetyRules, setSafetyRules] = useState(chatbot.safety_rules)
  const [systemPrompt, setSystemPrompt] = useState(chatbot.system_prompt || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.patch(`/chatbots/${chatbot.id}`, {
        personality,
        tone,
        response_format: responseFormat,
        safety_rules: safetyRules,
        system_prompt: systemPrompt || undefined,
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Personality */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Personality</CardTitle>
          <CardDescription className="text-slate-400 text-xs">How your chatbot presents itself</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {personalities.map((p) => (
              <button
                key={p.value}
                onClick={() => setPersonality(p.value)}
                className={cn(
                  'text-left rounded-xl border p-3 transition-colors',
                  personality === p.value
                    ? 'border-blue-600 bg-blue-600/10'
                    : 'border-slate-700 hover:border-slate-600'
                )}
              >
                <p className={cn('text-sm font-medium', personality === p.value ? 'text-blue-400' : 'text-slate-300')}>
                  {p.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tone */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Tone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm border transition-colors',
                  tone === t.value
                    ? 'border-blue-600 bg-blue-600/10 text-blue-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Response Format */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Response Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((f) => (
              <button
                key={f.value}
                onClick={() => setResponseFormat(f.value)}
                className={cn(
                  'text-left rounded-xl border p-3 transition-colors',
                  responseFormat === f.value
                    ? 'border-blue-600 bg-blue-600/10'
                    : 'border-slate-700 hover:border-slate-600'
                )}
              >
                <p className={cn('text-sm font-medium', responseFormat === f.value ? 'text-blue-400' : 'text-slate-300')}>
                  {f.label}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 font-mono">{f.example}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Rules */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Safety Rules</CardTitle>
          <CardDescription className="text-slate-400 text-xs">Control what your chatbot can and cannot do</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'cite_sources', label: 'Cite sources', desc: 'Reference document filenames in responses' },
            { key: 'stay_in_domain', label: 'Stay in domain', desc: "Only answer from uploaded documents" },
            { key: 'block_medical', label: 'Block medical advice', desc: 'Refuse to give medical recommendations' },
            { key: 'block_financial', label: 'Block financial advice', desc: 'Refuse to give financial/investment advice' },
          ].map((rule) => (
            <div key={rule.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200">{rule.label}</p>
                <p className="text-xs text-slate-500">{rule.desc}</p>
              </div>
              <Switch
                checked={!!(safetyRules as Record<string, boolean>)[rule.key]}
                onCheckedChange={(checked) =>
                  setSafetyRules((prev) => ({ ...prev, [rule.key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Custom System Prompt</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Override auto-generated prompt. Leave blank to use personality settings above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant for Acme Corp. Always be polite..."
            rows={5}
            className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600 resize-none font-mono text-xs focus-visible:ring-blue-500"
          />
          <p className="text-xs text-slate-600 mt-1">{systemPrompt.length} / 4000 characters</p>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  )
}
