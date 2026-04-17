-- Rate limit storage table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  scope text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits (scope, key, created_at DESC);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access - only triggers (security definer) touch this table
CREATE POLICY "No public access to rate_limits"
  ON public.rate_limits
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- Trigger function: limit contact_messages inserts to 5 per phone+name per 10 minutes
CREATE OR REPLACE FUNCTION public.enforce_contact_message_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_count int;
BEGIN
  -- Build a key from phone (or name fallback) - low-friction, blocks repeat senders
  v_key := COALESCE(NULLIF(NEW.phone, ''), NEW.name, 'anon');

  -- Cleanup old entries opportunistically (older than 1 hour)
  DELETE FROM public.rate_limits
  WHERE scope = 'contact_messages' AND created_at < now() - interval '1 hour';

  -- Count recent inserts in 10-minute window
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE scope = 'contact_messages'
    AND key = v_key
    AND created_at > now() - interval '10 minutes';

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'rate_limit_exceeded: too many contact messages, please try again later'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Record this attempt
  INSERT INTO public.rate_limits (key, scope) VALUES (v_key, 'contact_messages');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contact_messages_rate_limit ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_rate_limit
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_contact_message_rate_limit();