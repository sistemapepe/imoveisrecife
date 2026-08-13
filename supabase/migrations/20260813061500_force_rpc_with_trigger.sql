-- 1. DROP E CREATE TABELA LIMPA
DROP TABLE IF EXISTS public.role_permissions CASCADE;

CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role, permission)
);

-- 2. DESABILITAR RLS TOTAL
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT SELECT ON public.role_permissions TO anon;

-- 3. CRIAR VIEW PARA TESTAR ACESSO
CREATE OR REPLACE VIEW public.debug_perms AS SELECT * FROM public.role_permissions;
GRANT SELECT ON public.debug_perms TO authenticated;

-- 4. CRIAR RPC COM OUTRO NOME PARA EVITAR CACHE PERSISTENTE
CREATE OR REPLACE FUNCTION public.update_permissions_v2(p_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.role_permissions (role, permission, enabled)
    SELECT (item->>'role')::public.app_role, item->>'permission', (item->>'enabled')::boolean
    FROM jsonb_array_elements(p_data) AS item
    ON CONFLICT (role, permission) DO UPDATE SET enabled = EXCLUDED.enabled;
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_permissions_v2(jsonb) TO authenticated;

-- 5. NOTIFY PARA RECARREGAR
NOTIFY pgrst, 'reload schema';
