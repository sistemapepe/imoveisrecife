-- 1. Remover se existir para garantir limpeza total
DROP FUNCTION IF EXISTS public.save_role_permissions(jsonb);
DROP FUNCTION IF EXISTS public.upsert_role_permissions(jsonb);

-- 2. Recriar a função principal com parâmetros nomeados de forma simples
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

-- 3. Dar permissões
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.save_role_permissions(jsonb) TO service_role;

-- 4. Notificar o PostgREST para recarregar o cache (através de um comentário)
COMMENT ON FUNCTION public.save_role_permissions(jsonb) IS 'Função para salvar permissões de roles via RPC';
