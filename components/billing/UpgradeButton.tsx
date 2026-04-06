'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { Plan } from '@/types'

interface UpgradeButtonProps {
  currentPlan: Plan
}

export default function UpgradeButton({ currentPlan }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const targetPlan = currentPlan === 'free' ? 'starter' : 'pro'
  const label = currentPlan === 'free' ? 'Upgrade to Starter – $29/mo' : 'Upgrade to Pro – $99/mo'

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await api.post('/stripe/checkout', { planId: targetPlan })
      window.location.href = res.data.checkoutUrl
    } catch {
      toast.error('Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleUpgrade} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  )
}
