import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch document and verify ownership via chatbot
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .select('id, filename, chatbot_id, chatbots(user_id)')
    .eq('id', params.id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const chatbot = doc.chatbots as unknown as { user_id: string } | null
  if (!chatbot || chatbot.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete from storage
  if (doc.filename) {
    await supabaseAdmin.storage.from('documents').remove([doc.filename])
  }

  // Delete embeddings then document (cascade should handle it)
  await supabaseAdmin.from('document_embeddings').delete().eq('document_id', params.id)
  const { error } = await supabaseAdmin.from('documents').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
