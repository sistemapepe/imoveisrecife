-- Criar uma função para conceder acesso de admin a um site para o usuário atual
CREATE OR REPLACE FUNCTION public.assign_site_admin(p_site_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insere o papel de admin para o usuário no site específico
  -- Usamos ON CONFLICT para evitar erros se o registro já existir
  INSERT INTO public.user_roles (user_id, role, site_id)
  VALUES (p_user_id, 'admin', p_site_id)
  ON CONFLICT (user_id, role, site_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Garantir que apenas usuários autenticados possam chamar
REVOKE EXECUTE ON FUNCTION public.assign_site_admin(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_site_admin(UUID, UUID) TO authenticated;

-- Criar um log de auditoria para duplicação
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB
);

GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Evitar recursão usando o owner da função (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

CREATE POLICY "Super admins can view all logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Authenticated users can insert logs" 
ON public.audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Atualizar a função duplicate_site para incluir a atribuição automática de admin e log
CREATE OR REPLACE FUNCTION public.duplicate_site(
  source_site_id UUID,
  new_domain TEXT,
  new_brand_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_site_id UUID;
  v_current_user_id UUID := auth.uid();
BEGIN
  -- 1. Create the new site
  INSERT INTO public.sites (domain, brand_name, is_active, owner_id)
  VALUES (new_domain, new_brand_name, true, v_current_user_id)
  RETURNING id INTO v_new_site_id;

  -- 2. Duplicate site_settings
  INSERT INTO public.site_settings (
    site_id, hero_title, hero_subtitle, concierge_nome, concierge_cargo, concierge_desc,
    brand_name, logo_url, footer_text, creci, creci_uf, instagram_url, facebook_url,
    youtube_url, linkedin_url, website_url, primary_color, accent_color, banner_interval,
    whatsapp_message, available_amenities, privacy_policy, show_location_on_card,
    developer_name, developer_url, show_visit_schedule, lead_modal_enabled,
    lead_modal_show_skip, lead_modal_title, lead_modal_description, lead_modal_name_label,
    lead_modal_name_placeholder, lead_modal_phone_label, lead_modal_phone_placeholder,
    lead_modal_submit_text, lead_modal_submitting_text, lead_modal_skip_text,
    google_site_verification, bing_site_verification, header_style, marquee_text,
    images_access_mode, navbar_height_px, logo_width_px, logo_height_px,
    marquee_padding_y_px, watermark_enabled, watermark_opacity, watermark_size_pct,
    watermark_position, price_styles, price_format
  )
  SELECT
    v_new_site_id, hero_title, hero_subtitle, concierge_nome, concierge_cargo, concierge_desc,
    new_brand_name, logo_url, footer_text, creci, creci_uf, instagram_url, facebook_url,
    youtube_url, linkedin_url, website_url, primary_color, accent_color, banner_interval,
    whatsapp_message, available_amenities, privacy_policy, show_location_on_card,
    developer_name, developer_url, show_visit_schedule, lead_modal_enabled,
    lead_modal_show_skip, lead_modal_title, lead_modal_description, lead_modal_name_label,
    lead_modal_name_placeholder, lead_modal_phone_label, lead_modal_phone_placeholder,
    lead_modal_submit_text, lead_modal_submitting_text, lead_modal_skip_text,
    google_site_verification, bing_site_verification, header_style, marquee_text,
    images_access_mode, navbar_height_px, logo_width_px, logo_height_px,
    marquee_padding_y_px, watermark_enabled, watermark_opacity, watermark_size_pct,
    watermark_position, price_styles, price_format
  FROM public.site_settings
  WHERE site_id = source_site_id
  LIMIT 1;

  -- 3. Duplicate role_permissions
  INSERT INTO public.role_permissions (role, permission, site_id, enabled)
  SELECT role, permission, v_new_site_id, enabled
  FROM public.role_permissions
  WHERE site_id = source_site_id;

  -- 4. ATRIBUIÇÃO AUTOMÁTICA DE ACESSO
  IF v_current_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, site_id)
    VALUES (v_current_user_id, 'admin', v_new_site_id)
    ON CONFLICT (user_id, role, site_id) DO NOTHING;
    
    -- 5. LOG DE AUDITORIA
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      v_current_user_id, 
      'duplicate_site', 
      'site', 
      v_new_site_id, 
      jsonb_build_object(
        'source_site_id', source_site_id,
        'new_domain', new_domain,
        'new_brand_name', new_brand_name
      )
    );
  END IF;

  RETURN v_new_site_id;
END;
$$;