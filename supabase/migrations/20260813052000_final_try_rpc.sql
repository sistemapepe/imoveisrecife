-- 1. DROP TUDO para garantir estado limpo
DROP FUNCTION IF EXISTS public.save_role_permissions(jsonb);
DROP FUNCTION IF EXISTS public.upsert_role_permissions(jsonb);

-- 2. Recriar a função principal com parâmetros nomeados de forma simples
-- Note o uso de SECURITY DEFINER para rodar como owner (service_role)
CREATE OR REPLACE FUNCTION public.save_role_permissions(p_perms jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 3. Dar permissões explicitamente para todos
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO service_role;

-- 4. Notificar PostgREST
NOTIFY pgrst, 'reload schema';
