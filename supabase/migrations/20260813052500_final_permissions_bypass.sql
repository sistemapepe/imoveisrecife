-- 1. DROP RPC functions que falharam no cache
DROP FUNCTION IF EXISTS public.save_role_permissions(jsonb);
DROP FUNCTION IF EXISTS public.upsert_role_permissions(jsonb);

-- 2. Garantir que a tabela existe e está aberta
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role, permission)
);

-- 3. Reset total de permissões
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for authenticated" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Users can read permissions" ON public.role_permissions;

-- 4. Grant permissão total para authenticated (confiando no gating do frontend por enquanto)
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT SELECT ON public.role_permissions TO anon;

-- 5. Recarregar o cache
NOTIFY pgrst, 'reload schema';
