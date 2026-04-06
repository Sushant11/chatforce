'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  const handlePortal = async () => {
    setLoading(true)
    try {
      const res = await api.post('/stripe/portal')
      window.location.href = res.data.portalUrl
    } catch {
      toast.error('Failed to open billing portal')
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePortal} disabled={loading} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
      Manage Billing
    </Button>
  )
}
