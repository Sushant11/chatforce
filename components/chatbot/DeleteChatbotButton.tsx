'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface DeleteChatbotButtonProps {
  chatbotId: string
  chatbotName: string
}

export default function DeleteChatbotButton({ chatbotId, chatbotName }: DeleteChatbotButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/chatbots/${chatbotId}`)
      toast.success('Chatbot deleted')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to delete chatbot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-700">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete &ldquo;{chatbotName}&rdquo;?</DialogTitle>
          <DialogDescription className="text-slate-400">
            This will permanently delete the chatbot, all its documents, conversations, and settings. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-700 text-slate-300">
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-500 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Chatbot'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
