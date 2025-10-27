-- Create magic_link_tokens table for password reset with magic links
-- This table stores hashed tokens for secure one-time use password reset links

CREATE TABLE IF NOT EXISTS public.magic_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  jti text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_magic_link_tokens_token_hash ON public.magic_link_tokens(token_hash);
CREATE INDEX idx_magic_link_tokens_jti ON public.magic_link_tokens(jti);
CREATE INDEX idx_magic_link_tokens_user_id ON public.magic_link_tokens(user_id);
CREATE INDEX idx_magic_link_tokens_expires_at ON public.magic_link_tokens(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.magic_link_tokens ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for backend API)
CREATE POLICY "Service role can manage all tokens"
  ON public.magic_link_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment the table and columns
COMMENT ON TABLE public.magic_link_tokens IS 'Stores hashed magic link tokens for password reset';
COMMENT ON COLUMN public.magic_link_tokens.id IS 'Unique identifier for the token record';
COMMENT ON COLUMN public.magic_link_tokens.user_id IS 'Reference to the user this token belongs to';
COMMENT ON COLUMN public.magic_link_tokens.token_hash IS 'SHA256 hash of the magic link token';
COMMENT ON COLUMN public.magic_link_tokens.jti IS 'JWT ID for additional security (unique identifier)';
COMMENT ON COLUMN public.magic_link_tokens.expires_at IS 'Timestamp when the token expires';
COMMENT ON COLUMN public.magic_link_tokens.used_at IS 'Timestamp when the token was used (null if not used yet)';
COMMENT ON COLUMN public.magic_link_tokens.created_at IS 'Timestamp when the token was created';
