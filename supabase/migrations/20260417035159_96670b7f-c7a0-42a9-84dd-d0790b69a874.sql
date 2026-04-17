-- Add source column to contact_messages
ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'contato';

-- Index for analytics grouping
CREATE INDEX IF NOT EXISTS idx_contact_messages_source ON public.contact_messages(source);

-- Update public INSERT policy to allow source field with length limit
DROP POLICY IF EXISTS "Anyone can send contact message" ON public.contact_messages;

CREATE POLICY "Anyone can send contact message"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(name) > 0 AND length(name) <= 200
  AND length(email) > 0 AND length(email) <= 255
  AND length(phone) <= 50
  AND length(interest) <= 100
  AND length(message) <= 5000
  AND length(source) <= 50
);