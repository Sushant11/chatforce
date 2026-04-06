import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { chat, buildSystemPrompt, calculateCost, generateEmbedding } from '@/lib/claude'
import { chatMessageSchema } from '@/lib/validators'
import type { Chatbot } from '@/types'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = chatMessageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { message, conversationId, sessionId } = parsed.data

  // Fetch chatbot (also validates it exists)
  const { data: chatbot, error: chatbotError } = await supabaseAdmin
    .from('chatbots')
    .select('*')
    .eq('id', params.id)
    .single()

  if (chatbotError || !chatbot) {
    return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
  }

  const bot = chatbot as Chatbot

  // Get or create conversation
  let convoId = conversationId
  if (!convoId) {
    const { data: convo } = await supabaseAdmin
      .from('conversations')
      .insert({
        chatbot_id: params.id,
        session_id: sessionId || `anon-${Date.now()}`,
      })
      .select()
      .single()
    convoId = convo?.id
  }

  // Fetch recent conversation history
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  if (convoId) {
    const { data: msgs } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (msgs) {
      history.push(...msgs.reverse().map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })))
    }
  }

  // Semantic search for relevant document chunks
  let contextChunks: Array<{ text: string; filename: string; similarity: number }> = []
  try {
    const queryEmbedding = await generateEmbedding(message)

    const { data: chunks } = await supabaseAdmin.rpc('match_document_embeddings', {
      query_embedding: queryEmbedding,
      chatbot_id: params.id,
      match_count: 5,
    })

    if (chunks && chunks.length > 0) {
      contextChunks = chunks.map((c: { chunk_text: string; filename: string; similarity: number }) => ({
        text: c.chunk_text,
        filename: c.filename,
        similarity: c.similarity,
      }))
    }
  } catch {
    // Continue without context if embedding fails
  }

  // Build system prompt
  const systemPrompt = buildSystemPrompt(
    bot.personality,
    bot.tone,
    bot.response_format,
    bot.safety_rules,
    bot.system_prompt
  )

  // Call Claude
  const result = await chat({
    systemPrompt,
    contextChunks,
    history,
    userMessage: message,
    safetyRules: bot.safety_rules,
    responseFormat: bot.response_format,
    maxTokens: bot.max_response_length || 1024,
  })

  const cost = calculateCost(result.inputTokens, result.outputTokens)

  // Store messages
  if (convoId) {
    await supabaseAdmin.from('messages').insert([
      {
        conversation_id: convoId,
        chatbot_id: params.id,
        role: 'user',
        content: message,
      },
      {
        conversation_id: convoId,
        chatbot_id: params.id,
        role: 'assistant',
        content: result.content,
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        total_tokens: result.inputTokens + result.outputTokens,
        source_documents: result.sourceDocuments,
      },
    ])
  }

  // Log usage
  const { data: userRow } = await supabaseAdmin
    .from('chatbots')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (userRow) {
    await supabaseAdmin.from('usage_logs').insert({
      user_id: userRow.user_id,
      chatbot_id: params.id,
      event_type: 'message',
      tokens_used: result.inputTokens + result.outputTokens,
      cost_usd: cost,
    })
  }

  return NextResponse.json({
    message: result.content,
    conversationId: convoId,
    sourceDocuments: result.sourceDocuments,
    usage: {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    },
  })
}
