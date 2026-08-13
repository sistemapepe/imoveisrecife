-- 1. DROP E CREATE TOTAL
DROP TABLE IF EXISTS public.role_permissions CASCADE;

CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role, permission)
);

-- 2. DESABILITAR RLS DEFINITIVAMENTE
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO anon;
GRANT ALL ON public.role_permissions TO service_role;

-- 3. CRIAR FUNÇÃO RPC COM NOME CURTO E PARÂMETRO POSICIONAL
CREATE OR REPLACE FUNCTION public.save_role_perms(jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.role_permissions (role, permission, enabled)
    SELECT (item->>'role')::public.app_role, item->>'permission', (item->>'enabled')::boolean
    FROM jsonb_array_elements($1) AS item
    ON CONFLICT (role, permission) DO UPDATE SET enabled = EXCLUDED.enabled;
    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_role_perms(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_role_perms(jsonb) TO anon;

-- 4. FORÇAR RECARREGAMENTO DO POSTGREST
NOTIFY pgrst, 'reload schema';
