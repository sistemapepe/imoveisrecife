ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS lead_modal_title text NOT NULL DEFAULT 'Antes de continuar',
  ADD COLUMN IF NOT EXISTS lead_modal_description text NOT NULL DEFAULT 'Deixe seu contato para o corretor te chamar de volta caso o WhatsApp não responda.',
  ADD COLUMN IF NOT EXISTS lead_modal_name_label text NOT NULL DEFAULT 'Seu nome',
  ADD COLUMN IF NOT EXISTS lead_modal_name_placeholder text NOT NULL DEFAULT 'Como podemos te chamar?',
  ADD COLUMN IF NOT EXISTS lead_modal_phone_label text NOT NULL DEFAULT 'Telefone / WhatsApp',
  ADD COLUMN IF NOT EXISTS lead_modal_phone_placeholder text NOT NULL DEFAULT '(81) 99999-9999',
  ADD COLUMN IF NOT EXISTS lead_modal_submit_text text NOT NULL DEFAULT 'Continuar para o WhatsApp',
  ADD COLUMN IF NOT EXISTS lead_modal_submitting_text text NOT NULL DEFAULT 'Conectando...',
  ADD COLUMN IF NOT EXISTS lead_modal_skip_text text NOT NULL DEFAULT 'Prefiro não informar agora',
  ADD COLUMN IF NOT EXISTS lead_modal_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS lead_modal_show_skip boolean NOT NULL DEFAULT true;