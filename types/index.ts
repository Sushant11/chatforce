export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'
export type UserStatus = 'active' | 'suspended'
export type ChatbotStatus = 'draft' | 'published' | 'archived'
export type Personality = 'professional' | 'casual' | 'technical' | 'friendly'
export type Tone = 'neutral' | 'warm' | 'formal' | 'conversational'
export type ResponseFormat = 'prose' | 'bullets' | 'json' | 'markdown'
export type MessageRole = 'user' | 'assistant'
export type FileType = 'pdf' | 'txt' | 'md' | 'csv'
export type EventType = 'message' | 'document_upload' | 'api_call'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export interface User {
  id: string
  email: string
  name?: string
  auth_provider?: string
  stripe_customer_id?: string
  plan: Plan
  status: UserStatus
  usage_tier: number
  created_at: string
  updated_at: string
}

export interface SafetyRules {
  cite_sources?: boolean
  stay_in_domain?: boolean
  block_financial?: boolean
  block_medical?: boolean
  require_confirmation?: boolean
  blocked_keywords?: string[]
}

export interface Chatbot {
  id: string
  user_id: string
  name: string
  description?: string
  personality: Personality
  tone: Tone
  system_prompt?: string
  safety_rules: SafetyRules
  response_format: ResponseFormat
  max_response_length: number
  welcome_message?: string
  placeholder_text: string
  primary_color: string
  status: ChatbotStatus
  api_key?: string
  embed_code_generated: boolean
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  chatbot_id: string
  filename: string
  original_filename?: string
  file_url?: string
  file_type?: FileType
  file_size?: number
  raw_text?: string
  chunks: DocumentChunk[]
  embedding_model: string
  is_active: boolean
  priority: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface DocumentChunk {
  id: string
  text: string
  metadata?: Record<string, unknown>
}

export interface DocumentEmbedding {
  id: string
  document_id: string
  chunk_index: number
  chunk_text: string
  embedding: number[]
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Conversation {
  id: string
  chatbot_id: string
  user_id?: string
  session_id?: string
  created_at: string
  updated_at: string
}

export interface SourceDocument {
  id: string
  filename: string
  relevance_score: number
}

export interface Message {
  id: string
  conversation_id: string
  chatbot_id: string
  role: MessageRole
  content: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  source_documents: SourceDocument[]
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  chatbot_id: string
  event_type: EventType
  tokens_used: number
  cost_usd: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  plan: Plan
  status: SubscriptionStatus
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

// Analytics types
export interface DailyMetric {
  date: string
  count: number
}

export interface TokenMetric {
  date: string
  tokens: number
  cost: number
}

export interface TopQuestion {
  content: string
  frequency: number
}

export interface AnalyticsSummary {
  total_messages: number
  total_tokens: number
  estimated_cost: number
  avg_response_time: number
  messages_by_day: DailyMetric[]
  tokens_by_day: TokenMetric[]
  top_questions: TopQuestion[]
}

// Plan limits
export const PLAN_LIMITS: Record<Plan, {
  chatbots: number
  messages_per_month: number
  storage_mb: number
  api_access: boolean
}> = {
  free: { chatbots: 1, messages_per_month: 100, storage_mb: 50, api_access: false },
  starter: { chatbots: 2, messages_per_month: 10000, storage_mb: 1024, api_access: true },
  pro: { chatbots: 10, messages_per_month: 100000, storage_mb: 10240, api_access: true },
  enterprise: { chatbots: Infinity, messages_per_month: Infinity, storage_mb: Infinity, api_access: true },
}

export const PLAN_PRICES: Record<Plan, number> = {
  free: 0,
  starter: 29,
  pro: 99,
  enterprise: 0,
}
