-- 1. Default site for the network (fallback when hostname is unknown)
INSERT INTO public.network_settings (key, value, description)
VALUES ('default_site_id', to_jsonb('1f8ff626-396d-491d-b192-00a1bdf251eb'::text), 'Site exibido quando o domínio acessado não está cadastrado')
ON CONFLICT (key) DO NOTHING;

-- 2. Backfill orphan rows to the default site
UPDATE public.properties SET site_id = '1f8ff626-396d-491d-b192-00a1bdf251eb' WHERE site_id IS NULL;
UPDATE public.contact_info SET site_id = '1f8ff626-396d-491d-b192-00a1bdf251eb' WHERE site_id IS NULL;
UPDATE public.contact_messages SET site_id = '1f8ff626-396d-491d-b192-00a1bdf251eb' WHERE site_id IS NULL;
UPDATE public.visit_requests SET site_id = '1f8ff626-396d-491d-b192-00a1bdf251eb' WHERE site_id IS NULL;
UPDATE public.site_settings SET site_id = '1f8ff626-396d-491d-b192-00a1bdf251eb' WHERE site_id IS NULL;

-- 3. Seed tenant_domains from sites.domain (tenant ids mirror site ids)
INSERT INTO public.tenants (id, name, slug, status)
SELECT s.id, s.brand_name, 'site-' || s.id, 'active'
FROM public.sites s
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tenant_domains (tenant_id, hostname, is_primary, status)
SELECT s.id, lower(s.domain), true, 'active'
FROM public.sites s
WHERE s.domain IS NOT NULL AND s.domain <> ''
ON CONFLICT DO NOTHING;

-- also register the www/apex variant of each hostname
INSERT INTO public.tenant_domains (tenant_id, hostname, is_primary, status)
SELECT s.id,
       CASE WHEN lower(s.domain) LIKE 'www.%' THEN substring(lower(s.domain) from 5)
            ELSE 'www.' || lower(s.domain) END,
       false, 'active'
FROM public.sites s
WHERE s.domain IS NOT NULL AND s.domain <> '' AND s.domain <> 'localhost'
ON CONFLICT DO NOTHING;

-- 4. Hostname -> site resolution, callable publicly
CREATE OR REPLACE FUNCTION public.resolve_site_by_hostname(_hostname text)
RETURNS TABLE (site_id uuid, brand_name text, domain text, is_active boolean, matched boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_host text := lower(coalesce(_hostname, ''));
  v_alt text;
  v_id uuid;
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

  RETURN QUERY
    SELECT s.id, s.brand_name, s.domain, coalesce(s.is_active, true), false
    FROM public.sites s
    WHERE s.id = coalesce(v_id, (SELECT id FROM public.sites WHERE coalesce(is_active, true) ORDER BY created_at LIMIT 1))
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_site_by_hostname(text) TO anon, authenticated, service_role;

-- 5. Network overview for super admins
CREATE OR REPLACE FUNCTION public.network_sites_overview()
RETURNS TABLE (
  id uuid, domain text, brand_name text, is_active boolean, created_at timestamptz,
  properties_count bigint, messages_count bigint, users_count bigint, views_count bigint,
  hostnames text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.id, s.domain, s.brand_name, coalesce(s.is_active, true), s.created_at,
    (SELECT count(*) FROM public.properties p WHERE p.site_id = s.id),
    (SELECT count(*) FROM public.contact_messages m WHERE m.site_id = s.id),
    (SELECT count(DISTINCT ur.user_id) FROM public.user_roles ur WHERE ur.site_id = s.id),
    (SELECT count(*) FROM public.property_views v WHERE v.site_id = s.id),
    coalesce((SELECT array_agg(td.hostname ORDER BY td.is_primary DESC NULLS LAST, td.hostname)
              FROM public.tenant_domains td WHERE td.tenant_id = s.id), ARRAY[]::text[])
  FROM public.sites s
  WHERE internal.is_super_admin(auth.uid())
  ORDER BY s.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.network_sites_overview() TO authenticated, service_role;

-- 6. Manage hostnames of a site (super admin only)
CREATE OR REPLACE FUNCTION public.network_add_domain(p_site_id uuid, p_hostname text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_host text := lower(btrim(coalesce(p_hostname, '')));
BEGIN
  IF NOT internal.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: apenas super admin';
  END IF;
  v_host := regexp_replace(v_host, '^https?://', '');
  v_host := split_part(split_part(v_host, '/', 1), ':', 1);
  IF v_host = '' THEN RAISE EXCEPTION 'validation_error: domínio inválido'; END IF;

  INSERT INTO public.tenants (id, name, slug, status)
  SELECT s.id, s.brand_name, 'site-' || s.id, 'active' FROM public.sites s WHERE s.id = p_site_id
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.tenant_domains (tenant_id, hostname, is_primary, status)
  VALUES (p_site_id, v_host, false, 'active')
  ON CONFLICT (hostname) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, status = 'active', updated_at = now();
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.network_add_domain(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.network_remove_domain(p_hostname text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT internal.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: apenas super admin';
  END IF;
  DELETE FROM public.tenant_domains WHERE hostname = lower(btrim(p_hostname));
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.network_remove_domain(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.network_set_site_active(p_site_id uuid, p_active boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT internal.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: apenas super admin';
  END IF;
  UPDATE public.sites SET is_active = p_active, updated_at = now() WHERE id = p_site_id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.network_set_site_active(uuid, boolean) TO authenticated, service_role;

-- 7. Site-scoped defaults on insert (properties)
CREATE OR REPLACE FUNCTION public.set_property_site_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.site_id IS NULL THEN
    SELECT ur.site_id INTO NEW.site_id
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.site_id IS NOT NULL
    LIMIT 1;
  END IF;
  IF NEW.site_id IS NULL THEN
    SELECT (ns.value #>> '{}')::uuid INTO NEW.site_id
    FROM public.network_settings ns WHERE ns.key = 'default_site_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_property_site_id ON public.properties;
CREATE TRIGGER trg_set_property_site_id
BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.set_property_site_id();

-- 8. Property code sequence must be per site
CREATE OR REPLACE FUNCTION public.generate_property_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
  seq int;
  prefix text;
BEGIN
  SELECT UPPER(LEFT(brand_name, 3)) INTO prefix
  FROM public.site_settings WHERE site_id = NEW.site_id LIMIT 1;
  IF prefix IS NULL OR prefix = '' THEN
    SELECT UPPER(LEFT(brand_name, 3)) INTO prefix FROM public.site_settings LIMIT 1;
  END IF;
  IF prefix IS NULL OR prefix = '' THEN
    prefix := 'IMO';
  END IF;
  prefix := translate(prefix, 'ÀÁÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'AAAAAEEEEIIIIOOOOOUUUUC');

  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM LENGTH(prefix) + 2) AS integer)), 0) + 1
  INTO seq
  FROM public.properties
  WHERE code IS NOT NULL AND code LIKE prefix || '-%'
    AND (NEW.site_id IS NULL OR site_id IS NOT DISTINCT FROM NEW.site_id);

  new_code := prefix || '-' || LPAD(seq::text, 4, '0');
  NEW.code := new_code;
  RETURN NEW;
END;
$$;

-- ensure site is assigned before the code is generated
DROP TRIGGER IF EXISTS set_property_code ON public.properties;
CREATE TRIGGER set_property_code
BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.generate_property_code();

-- 9. Public read policies scoped to active sites
DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
CREATE POLICY "Anyone can view properties of active sites"
ON public.properties FOR SELECT TO public
USING (
  site_id IS NULL OR EXISTS (
    SELECT 1 FROM public.sites s WHERE s.id = properties.site_id AND coalesce(s.is_active, true)
  )
);
