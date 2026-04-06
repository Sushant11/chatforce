import { z } from 'zod'

export const createChatbotSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(64, 'Name must be under 64 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  system_prompt: z.string().max(4000, 'System prompt must be under 4000 characters').optional(),
})

export const updateChatbotSchema = z.object({
  name: z.string().min(3).max(64).optional(),
  description: z.string().max(500).optional(),
  personality: z.enum(['professional', 'casual', 'technical', 'friendly']).optional(),
  tone: z.enum(['neutral', 'warm', 'formal', 'conversational']).optional(),
  system_prompt: z.string().max(4000).optional(),
  safety_rules: z
    .object({
      cite_sources: z.boolean().optional(),
      stay_in_domain: z.boolean().optional(),
      block_financial: z.boolean().optional(),
      block_medical: z.boolean().optional(),
      require_confirmation: z.boolean().optional(),
      blocked_keywords: z.array(z.string()).optional(),
    })
    .optional(),
  response_format: z.enum(['prose', 'bullets', 'json', 'markdown']).optional(),
  max_response_length: z.number().min(100).max(4000).optional(),
  welcome_message: z.string().max(500).optional(),
  placeholder_text: z.string().max(100).optional(),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  conversationId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
})

export const stripeCheckoutSchema = z.object({
  planId: z.enum(['starter', 'pro']),
})

export type CreateChatbotInput = z.infer<typeof createChatbotSchema>
export type UpdateChatbotInput = z.infer<typeof updateChatbotSchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>
