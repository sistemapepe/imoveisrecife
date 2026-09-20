CREATE OR REPLACE FUNCTION public.site_set_custom_domain(p_site_id uuid, p_hostname text)
RETURNS TABLE(hostname text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_host text := lower(btrim(coalesce(p_hostname, '')));
  v_alt text;
BEGIN
  IF NOT (internal.is_super_admin(auth.uid()) OR internal.has_role(auth.uid(), 'admin'::app_role, p_site_id)) THEN
    RAISE EXCEPTION 'forbidden: sem permissão para este site';
  END IF;

  v_host := regexp_replace(v_host, '^https?://', '');
  v_host := split_part(split_part(v_host, '/', 1), ':', 1);
  IF v_host = '' OR v_host !~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$' THEN
    RAISE EXCEPTION 'validation_error: domínio inválido';
  END IF;

  v_alt := CASE WHEN v_host LIKE 'www.%' THEN substring(v_host from 5) ELSE 'www.' || v_host END;

  INSERT INTO public.tenants (id, name, slug, status)
  SELECT s.id, s.brand_name, 'site-' || s.id, 'active' FROM public.sites s WHERE s.id = p_site_id
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.tenant_domains (tenant_id, hostname, is_primary, status)
  VALUES (p_site_id, v_host, true, 'pending')
  ON CONFLICT (hostname) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, is_primary = true, updated_at = now();

  INSERT INTO public.tenant_domains (tenant_id, hostname, is_primary, status)
  VALUES (p_site_id, v_alt, false, 'pending')
  ON CONFLICT (hostname) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, updated_at = now();

  UPDATE public.sites SET domain = v_host, updated_at = now() WHERE id = p_site_id;

  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details, site_id)
  VALUES (auth.uid(), 'set_custom_domain', 'site', p_site_id, jsonb_build_object('hostname', v_host, 'alt', v_alt), p_site_id);

  RETURN QUERY SELECT td.hostname FROM public.tenant_domains td WHERE td.tenant_id = p_site_id ORDER BY td.is_primary DESC NULLS LAST, td.hostname;
END;
$$;

CREATE OR REPLACE FUNCTION public.site_remove_custom_domain(p_site_id uuid, p_hostname text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT (internal.is_super_admin(auth.uid()) OR internal.has_role(auth.uid(), 'admin'::app_role, p_site_id)) THEN
    RAISE EXCEPTION 'forbidden: sem permissão para este site';
  END IF;
  DELETE FROM public.tenant_domains WHERE tenant_id = p_site_id AND hostname = lower(btrim(p_hostname));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.site_list_domains(p_site_id uuid)
RETURNS TABLE(hostname text, is_primary boolean, status domain_status, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT td.hostname, coalesce(td.is_primary,false), td.status, td.created_at
  FROM public.tenant_domains td
  WHERE td.tenant_id = p_site_id
    AND (internal.is_super_admin(auth.uid()) OR internal.has_role(auth.uid(), 'admin'::app_role, p_site_id))
  ORDER BY coalesce(td.is_primary,false) DESC, td.hostname;
$$;

GRANT EXECUTE ON FUNCTION public.site_set_custom_domain(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.site_remove_custom_domain(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.site_list_domains(uuid) TO authenticated;