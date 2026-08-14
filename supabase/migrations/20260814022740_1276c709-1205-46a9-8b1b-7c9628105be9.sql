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
BEGIN
  -- 1. Create the new site
  INSERT INTO public.sites (domain, brand_name, is_active)
  VALUES (new_domain, new_brand_name, true)
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

  RETURN v_new_site_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.duplicate_site(UUID, TEXT, TEXT) TO authenticated;
