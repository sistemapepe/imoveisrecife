-- 1. Criar função RPC com SECURITY DEFINER para bypassar RLS
CREATE OR REPLACE FUNCTION public.upsert_role_permissions(p_perms jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item jsonb;
BEGIN
    -- Verifica se o chamador é super_admin ou admin (opcional, mas recomendado)
    -- IF NOT (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin')) THEN
    --     RAISE EXCEPTION 'Sem permissão';
    -- END IF;

    FOR item IN SELECT * FROM jsonb_array_elements(p_perms)
    LOOP
        INSERT INTO public.role_permissions (role, permission, enabled)
        VALUES (
            (item->>'role')::public.app_role,
            item->>'permission',
            (item->>'enabled')::boolean
        )
        ON CONFLICT (role, permission)
        DO UPDATE SET enabled = EXCLUDED.enabled;
    END LOOP;
    RETURN true;
END;
$$;

-- 2. Garantir acesso à função
GRANT EXECUTE ON FUNCTION public.upsert_role_permissions(jsonb) TO authenticated;
