import Anthropic from '@anthropic-ai/sdk'
import { SafetyRules, Personality, Tone, ResponseFormat, SourceDocument } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  systemPrompt: string
  contextChunks: Array<{ text: string; filename: string; similarity: number }>
  history: ChatMessage[]
  userMessage: string
  safetyRules: SafetyRules
  responseFormat: ResponseFormat
  maxTokens?: number
}

export interface ChatResult {
  content: string
  inputTokens: number
  outputTokens: number
  sourceDocuments: SourceDocument[]
}

export function buildSystemPrompt(
  personality: Personality,
  tone: Tone,
  responseFormat: ResponseFormat,
  safetyRules: SafetyRules,
  customPrompt?: string
): string {
  if (customPrompt) return customPrompt

  const personalityDesc: Record<Personality, string> = {
    professional: 'professional and knowledgeable',
    casual: 'friendly and approachable',
    technical: 'technically precise and detailed',
    friendly: 'warm, supportive, and encouraging',
  }

  const toneDesc: Record<Tone, string> = {
    neutral: 'neutral and balanced',
    warm: 'warm and empathetic',
    formal: 'formal and structured',
    conversational: 'conversational and natural',
  }

  const formatDesc: Record<ResponseFormat, string> = {
    prose: 'clear paragraphs',
    bullets: 'bullet points',
    json: 'valid JSON',
    markdown: 'markdown formatting',
  }

  let prompt = `You are a ${personalityDesc[personality]} AI assistant. `
  prompt += `Respond in a ${toneDesc[tone]} manner. `
  prompt += `Format your responses as ${formatDesc[responseFormat]}. `

  if (safetyRules.stay_in_domain) {
    prompt += `Only answer questions based on the provided document context. If information is not in the documents, clearly state that you don't have that information. `
  }
  if (safetyRules.block_medical) {
    prompt += `Do NOT provide medical advice, diagnoses, or treatment recommendations. `
  }
  if (safetyRules.block_financial) {
    prompt += `Do NOT provide specific financial advice, investment recommendations, or tax guidance. `
  }
  if (safetyRules.cite_sources) {
    prompt += `Always reference the source document when providing information. `
  }
  if (safetyRules.blocked_keywords?.length) {
    prompt += `Never mention: ${safetyRules.blocked_keywords.join(', ')}. `
  }

  return prompt
}

export async function chat(options: ChatOptions): Promise<ChatResult> {
  const { systemPrompt, contextChunks, history, userMessage, safetyRules, maxTokens = 1024 } = options

  // Build context from retrieved document chunks
  let contextText = ''
  if (contextChunks.length > 0) {
    contextText = '\n\n<relevant_documents>\n'
    contextChunks.forEach((chunk, i) => {
      contextText += `[Source ${i + 1}: ${chunk.filename}]\n${chunk.text}\n\n`
    })
    contextText += '</relevant_documents>\n'
  }

  const fullSystemPrompt = systemPrompt + contextText

  // Build message history (last 10 messages max)
  const recentHistory = history.slice(-10)
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...recentHistory,
    { role: 'user', content: `<user_message>${userMessage}</user_message>` },
  ]

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: maxTokens,
    system: fullSystemPrompt,
    messages,
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens

  // Build source documents list
  const sourceDocuments: SourceDocument[] = contextChunks
    .filter((chunk) => content.toLowerCase().includes(chunk.filename.toLowerCase()) || safetyRules.cite_sources)
    .slice(0, 3)
    .map((chunk) => ({
      id: '',
      filename: chunk.filename,
      relevance_score: chunk.similarity,
    }))

  return { content, inputTokens, outputTokens, sourceDocuments }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateEmbedding(text: string): Promise<number[]> {
  // Using Voyage AI via Anthropic or a simple approach with text-embedding-3-small
  // For now, we'll use a mock embedding since Anthropic doesn't have a direct embedding endpoint
  // In production, use OpenAI text-embedding-3-small or Voyage AI
  // This is a placeholder that returns a random normalized vector
  const dimension = 1536
  const embedding = Array.from({ length: dimension }, () => Math.random() - 0.5)
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map((val) => val / magnitude)
}

export function calculateCost(inputTokens: number, outputTokens: number): number {
  // Claude 3.5 Sonnet pricing
  const inputCost = (inputTokens / 1_000_000) * 3.0
  const outputCost = (outputTokens / 1_000_000) * 15.0
  return inputCost + outputCost
}
