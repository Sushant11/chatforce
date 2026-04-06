-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  auth_provider VARCHAR,
  stripe_customer_id VARCHAR UNIQUE,
  plan VARCHAR DEFAULT 'free',
  status VARCHAR DEFAULT 'active',
  usage_tier INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chatbots table
CREATE TABLE IF NOT EXISTS chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  personality VARCHAR DEFAULT 'professional',
  tone VARCHAR DEFAULT 'neutral',
  system_prompt TEXT,
  safety_rules JSONB DEFAULT '{}',
  response_format VARCHAR DEFAULT 'prose',
  max_response_length INT DEFAULT 500,
  welcome_message TEXT,
  placeholder_text VARCHAR DEFAULT 'Ask me anything...',
  primary_color VARCHAR DEFAULT '#3b82f6',
  status VARCHAR DEFAULT 'draft',
  api_key VARCHAR UNIQUE,
  embed_code_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  filename VARCHAR NOT NULL,
  original_filename VARCHAR,
  file_url VARCHAR,
  file_type VARCHAR,
  file_size INT,
  raw_text TEXT,
  chunks JSONB DEFAULT '[]',
  embedding_model VARCHAR DEFAULT 'text-embedding-3-small',
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 1,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document embeddings (pgvector)
CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT,
  chunk_text TEXT,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create ivfflat index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx
  ON document_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  user_id UUID,
  session_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL,
  content TEXT NOT NULL,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  source_documents JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  event_type VARCHAR,
  tokens_used INT DEFAULT 0,
  cost_usd NUMERIC(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR,
  plan VARCHAR,
  status VARCHAR,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RPC function for semantic search
CREATE OR REPLACE FUNCTION match_document_embeddings(
  query_embedding vector(1536),
  chatbot_id UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  chunk_text TEXT,
  filename VARCHAR,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    de.id,
    de.chunk_text,
    d.original_filename AS filename,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  JOIN documents d ON d.id = de.document_id
  WHERE d.chatbot_id = match_document_embeddings.chatbot_id
    AND d.is_active = TRUE
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Storage bucket (run via Supabase dashboard or CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
