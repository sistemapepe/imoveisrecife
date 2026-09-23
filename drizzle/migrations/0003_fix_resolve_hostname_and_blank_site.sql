-- 1) Corrige ambiguidade de "is_active" no fallback de resolve_site_by_hostname
CREATE OR REPLACE FUNCTION public.resolve_site_by_hostname(_hostname text)
 RETURNS TABLE(site_id uuid, brand_name text, domain text, is_active boolean, matched boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_host text := lower(coalesce(_hostname, ''));
  v_alt text;
  v_id uuid;
  v_fallback uuid;
BEGIN
  v_host := split_part(v_host, ':', 1);
  v_alt := CASE WHEN v_host LIKE 'www.%' THEN substring(v_host from 5) ELSE 'www.' || v_host END;

  SELECT td.tenant_id INTO v_id
  FROM public.tenant_domains td
  WHERE td.hostname IN (v_host, v_alt)
  ORDER BY (td.hostname = v_host) DESC, td.is_primary DESC NULLS LAST
  LIMIT 1;

  IF v_id IS NULL THEN
    SELECT s.id INTO v_id FROM public.sites s WHERE lower(s.domain) IN (v_host, v_alt) LIMIT 1;
  END IF;

  IF v_id IS NOT NULL THEN
    RETURN QUERY
      SELECT s.id, s.brand_name, s.domain, coalesce(s.is_active, true), true
      FROM public.sites s WHERE s.id = v_id;
    RETURN;
  END IF;

  SELECT (ns.value #>> '{}')::uuid INTO v_id
  FROM public.network_settings ns WHERE ns.key = 'default_site_id';

  IF v_id IS NULL THEN
    SELECT s2.id INTO v_fallback
    FROM public.sites s2
    WHERE coalesce(s2.is_active, true)
    ORDER BY s2.created_at
    LIMIT 1;
    v_id := v_fallback;
  END IF;

  RETURN QUERY
    SELECT s.id, s.brand_name, s.domain, coalesce(s.is_active, true), false
    FROM public.sites s
    WHERE s.id = v_id
    LIMIT 1;
END;
$function$;

-- 2) Criação de site EM BRANCO (sem copiar marca/conteudo de outro site)
CREATE OR REPLACE FUNCTION public.create_blank_site(new_domain text, new_brand_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_site_id uuid;
  v_uid uuid := auth.uid();
BEGIN
  IF NOT internal.is_super_admin(v_uid) THEN
    RAISE EXCEPTION 'forbidden: apenas super admin';
  END IF;

  INSERT INTO public.sites (domain, brand_name, is_active, owner_id)
  VALUES (lower(btrim(new_domain)), new_brand_name, true, v_uid)
  RETURNING id INTO v_new_site_id;

  -- settings totalmente padrao (defaults da tabela), apenas a marca definida
  INSERT INTO public.site_settings (site_id, brand_name)
  VALUES (v_new_site_id, new_brand_name);

  -- permissoes padrao por papel (sem herdar de outro site)
  INSERT INTO public.role_permissions (role, permission, site_id, enabled)
  SELECT DISTINCT rp.role, rp.permission, v_new_site_id,
         CASE WHEN rp.role IN ('admin','super_admin') THEN true ELSE false END
  FROM public.role_permissions rp
  WHERE rp.site_id IS NOT NULL
  ON CONFLICT (role, permission, site_id) DO NOTHING;

  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, site_id)
    VALUES (v_uid, 'admin', v_new_site_id)
    ON CONFLICT (user_id, role, site_id) DO NOTHING;

    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details, site_id)
    VALUES (v_uid, 'create_blank_site', 'site', v_new_site_id,
            jsonb_build_object('domain', new_domain, 'brand_name', new_brand_name), v_new_site_id);
  END IF;

  RETURN v_new_site_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.create_blank_site(text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_blank_site(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_blank_site(text, text) TO service_role;