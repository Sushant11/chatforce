import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { chunkText } from '@/lib/utils'
import { generateEmbedding } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const chatbotId = formData.get('chatbotId') as string | null

  if (!file || !chatbotId) {
    return NextResponse.json({ error: 'Missing file or chatbotId' }, { status: 400 })
  }

  // Verify chatbot belongs to user
  const { data: chatbot } = await supabaseAdmin
    .from('chatbots')
    .select('id')
    .eq('id', chatbotId)
    .eq('user_id', session.user.id)
    .single()

  if (!chatbot) return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
  }

  const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv']
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|txt|md|csv)$/i)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  // Read file content
  const buffer = await file.arrayBuffer()
  let rawText = ''

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const pdfData = await pdfParse(Buffer.from(buffer))
      rawText = pdfData.text
    } catch {
      return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 422 })
    }
  } else {
    rawText = new TextDecoder().decode(buffer)
  }

  if (!rawText.trim()) {
    return NextResponse.json({ error: 'Could not extract text from file' }, { status: 422 })
  }

  // Upload to Supabase Storage
  const storagePath = `${session.user.id}/${chatbotId}/${Date.now()}-${file.name}`
  const { error: storageError } = await supabaseAdmin.storage
    .from('documents')
    .upload(storagePath, buffer, { contentType: file.type })

  let fileUrl: string | undefined
  if (!storageError) {
    const { data: urlData } = supabaseAdmin.storage.from('documents').getPublicUrl(storagePath)
    fileUrl = urlData.publicUrl
  }

  // Create document record
  const { data: document, error: docError } = await supabaseAdmin
    .from('documents')
    .insert({
      chatbot_id: chatbotId,
      filename: storagePath,
      original_filename: file.name,
      file_url: fileUrl,
      file_type: file.name.split('.').pop()?.toLowerCase(),
      file_size: file.size,
      raw_text: rawText,
    })
    .select()
    .single()

  if (docError || !document) {
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
  }

  // Chunk and embed
  const chunks = chunkText(rawText)

  const embeddings = await Promise.allSettled(
    chunks.map(async (chunk, index) => {
      const embedding = await generateEmbedding(chunk)
      return { chunk, index, embedding }
    })
  )

  const embeddingRows = embeddings
    .filter((r): r is PromiseFulfilledResult<{ chunk: string; index: number; embedding: number[] }> => r.status === 'fulfilled')
    .map(({ value }) => ({
      document_id: document.id,
      chunk_index: value.index,
      chunk_text: value.chunk,
      embedding: JSON.stringify(value.embedding),
      metadata: { filename: file.name, chatbot_id: chatbotId },
    }))

  if (embeddingRows.length > 0) {
    await supabaseAdmin.from('document_embeddings').insert(embeddingRows)
  }

  return NextResponse.json({
    document,
    chunkCount: embeddingRows.length,
    status: 'ready',
  })
}
