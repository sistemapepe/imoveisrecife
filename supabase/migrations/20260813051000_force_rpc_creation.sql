-- 1. Tentar criar a função com um nome ligeiramente diferente para forçar o cache se houver conflito
CREATE OR REPLACE FUNCTION public.save_role_permissions(p_perms jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    item jsonb;
BEGIN
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

-- 2. Garantir acesso
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO service_role;

-- 3. Criar a original também para redundância, garantindo que não falhe
CREATE OR REPLACE FUNCTION public.upsert_role_permissions(p_perms jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN public.save_role_permissions(p_perms);
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_role_permissions(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_role_permissions(jsonb) TO service_role;
