import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { chat, buildSystemPrompt, calculateCost, generateEmbedding } from '@/lib/claude'
import type { Chatbot } from '@/types'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }

  const body = await req.json()
  const { message, sessionId } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Look up chatbot by API key
  const { data: chatbot } = await supabaseAdmin
    .from('chatbots')
    .select('*')
    .eq('api_key', apiKey)
    .eq('status', 'published')
    .single()

  if (!chatbot) {
    return NextResponse.json({ error: 'Invalid API key or chatbot not published' }, { status: 403 })
  }

  const bot = chatbot as Chatbot

  // Get or create conversation
  let conversationId: string | undefined
  if (sessionId) {
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('chatbot_id', bot.id)
      .eq('session_id', sessionId)
      .single()

    if (existing) {
      conversationId = existing.id
    } else {
      const { data: newConvo } = await supabaseAdmin
        .from('conversations')
        .insert({ chatbot_id: bot.id, session_id: sessionId })
        .select()
        .single()
      conversationId = newConvo?.id
    }
  }

  // Fetch history
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  if (conversationId) {
    const { data: msgs } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (msgs) history.push(...msgs.reverse().map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })))
  }

  // RAG
  let contextChunks: Array<{ text: string; filename: string; similarity: number }> = []
  try {
    const queryEmbedding = await generateEmbedding(message)
    const { data: chunks } = await supabaseAdmin.rpc('match_document_embeddings', {
      query_embedding: queryEmbedding,
      chatbot_id: bot.id,
      match_count: 5,
    })
    if (chunks) {
      contextChunks = chunks.map((c: { chunk_text: string; filename: string; similarity: number }) => ({
        text: c.chunk_text,
        filename: c.filename,
        similarity: c.similarity,
      }))
    }
  } catch { /* continue without context */ }

  const systemPrompt = buildSystemPrompt(bot.personality, bot.tone, bot.response_format, bot.safety_rules, bot.system_prompt)

  const result = await chat({ systemPrompt, contextChunks, history, userMessage: message, safetyRules: bot.safety_rules, responseFormat: bot.response_format })
  const cost = calculateCost(result.inputTokens, result.outputTokens)

  // Store
  if (conversationId) {
    await supabaseAdmin.from('messages').insert([
      { conversation_id: conversationId, chatbot_id: bot.id, role: 'user', content: message },
      { conversation_id: conversationId, chatbot_id: bot.id, role: 'assistant', content: result.content, input_tokens: result.inputTokens, output_tokens: result.outputTokens, total_tokens: result.inputTokens + result.outputTokens, source_documents: result.sourceDocuments },
    ])
  }

  const { data: userRow } = await supabaseAdmin.from('chatbots').select('user_id').eq('id', bot.id).single()
  if (userRow) {
    await supabaseAdmin.from('usage_logs').insert({ user_id: userRow.user_id, chatbot_id: bot.id, event_type: 'api_call', tokens_used: result.inputTokens + result.outputTokens, cost_usd: cost })
  }

  return NextResponse.json({ message: result.content, sourceDocuments: result.sourceDocuments, conversationId })
}
