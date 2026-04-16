-- 1. Create private contact_info table
CREATE TABLE IF NOT EXISTS public.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text NOT NULL DEFAULT '',
  email_contact text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Only admins can read directly (public reads must go through edge function)
CREATE POLICY "Admins can view contact info"
ON public.contact_info FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert contact info"
ON public.contact_info FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update contact info"
ON public.contact_info FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Migrate existing values from site_settings into contact_info
INSERT INTO public.contact_info (whatsapp_number, email_contact)
SELECT whatsapp_number, email_contact FROM public.site_settings LIMIT 1;

-- 3. Drop columns from site_settings
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS whatsapp_number;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS email_contact;

-- 4. Trigger to update updated_at
CREATE TRIGGER update_contact_info_updated_at
BEFORE UPDATE ON public.contact_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();