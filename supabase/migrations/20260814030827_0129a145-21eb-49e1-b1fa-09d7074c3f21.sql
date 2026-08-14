-- Fix duplicate key violation in duplicate_site by adding ON CONFLICT to role_permissions insert
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

  -- 3. Duplicate role_permissions with ON CONFLICT to avoid duplicate key errors
  -- The unique constraint is on (role, permission, site_id)
  INSERT INTO public.role_permissions (role, permission, site_id, enabled)
  SELECT role, permission, v_new_site_id, enabled
  FROM public.role_permissions
  WHERE site_id = source_site_id
  ON CONFLICT (role, permission, site_id) DO UPDATE SET enabled = EXCLUDED.enabled;

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
