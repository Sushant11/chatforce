import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { generateApiKey } from '@/lib/utils'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: chatbot } = await supabaseAdmin
    .from('chatbots')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (!chatbot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const apiKey = generateApiKey()

  const { error } = await supabaseAdmin
    .from('chatbots')
    .update({ api_key: apiKey, updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ apiKey })
}
