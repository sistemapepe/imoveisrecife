CREATE OR REPLACE FUNCTION public.network_delete_site(p_site_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_default uuid;
  v_brand text;
BEGIN
  IF NOT internal.is_super_admin(v_uid) THEN
    RAISE EXCEPTION 'forbidden: apenas super admin';
  END IF;

  SELECT (ns.value #>> '{}')::uuid INTO v_default
  FROM public.network_settings ns WHERE ns.key = 'default_site_id';

  IF v_default IS NOT NULL AND v_default = p_site_id THEN
    RAISE EXCEPTION 'forbidden: o site principal da rede nao pode ser excluido';
  END IF;

  SELECT s.brand_name INTO v_brand FROM public.sites s WHERE s.id = p_site_id;
  IF v_brand IS NULL THEN
    RAISE EXCEPTION 'not_found: site inexistente';
  END IF;

  DELETE FROM public.tenant_domains WHERE tenant_id = p_site_id;
  DELETE FROM public.tenants WHERE id = p_site_id;
  DELETE FROM public.traffic_events WHERE site_id = p_site_id;
  DELETE FROM public.property_views WHERE site_id = p_site_id;
  DELETE FROM public.visit_requests WHERE site_id = p_site_id;
  DELETE FROM public.contact_messages WHERE site_id = p_site_id;
  DELETE FROM public.contact_info WHERE site_id = p_site_id;
  DELETE FROM public.performance_logs WHERE site_id = p_site_id;
  DELETE FROM public.import_history WHERE site_id = p_site_id;
  DELETE FROM public.favorites f USING public.properties p
    WHERE f.property_id = p.id AND p.site_id = p_site_id;
  DELETE FROM public.properties WHERE site_id = p_site_id;
  DELETE FROM public.role_permissions WHERE site_id = p_site_id;
  DELETE FROM public.user_roles WHERE site_id = p_site_id;
  DELETE FROM public.site_settings WHERE site_id = p_site_id;

  UPDATE public.audit_logs SET site_id = NULL WHERE site_id = p_site_id;

  DELETE FROM public.sites WHERE id = p_site_id;

  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (v_uid, 'network_delete_site', 'site', p_site_id,
          jsonb_build_object('brand_name', v_brand));

  RETURN true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.network_delete_site(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.network_delete_site(uuid) TO service_role;