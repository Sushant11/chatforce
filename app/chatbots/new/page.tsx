'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createChatbotSchema, type CreateChatbotInput } from '@/lib/validators'
import api from '@/lib/api'
import { ArrowLeft, Bot, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewChatbotPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateChatbotInput>({
    resolver: zodResolver(createChatbotSchema),
  })

  const onSubmit = async (data: CreateChatbotInput) => {
    setLoading(true)
    try {
      const res = await api.post('/chatbots', data)
      toast.success('Chatbot created!')
      router.push(`/chatbots/${res.data.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Link href="/chatbots">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Chatbot</h1>
          <p className="text-slate-400 text-sm">Set up your chatbot and start uploading documents</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 mb-2">
            <Bot className="h-5 w-5 text-blue-400" />
          </div>
          <CardTitle className="text-white">Chatbot Details</CardTitle>
          <CardDescription className="text-slate-400">
            Give your chatbot a name and description. You can change these later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-slate-300">
                Chatbot Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Support Assistant, Product FAQ"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-slate-300">
                Description <span className="text-slate-500">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="What does this chatbot do? Who is it for?"
                rows={3}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 resize-none"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="system_prompt" className="text-slate-300">
                Initial System Prompt <span className="text-slate-500">(optional)</span>
              </Label>
              <Textarea
                id="system_prompt"
                placeholder="Leave blank to auto-generate from personality settings. Or write a custom system prompt here."
                rows={4}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 resize-none font-mono text-xs"
                {...register('system_prompt')}
              />
              <p className="text-xs text-slate-500">
                You can always customize this later from the Customize tab.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Chatbot'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
