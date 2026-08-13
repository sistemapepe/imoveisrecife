-- 1. DROP E CREATE TOTAL para limpar qualquer lixo de RLS
DROP TABLE IF EXISTS public.role_permissions;

CREATE TABLE public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role, permission)
);

-- 2. Grant imediato SEM habilitar RLS
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
GRANT SELECT ON public.role_permissions TO anon;

-- 3. NÃO habilitar RLS. Deixar desabilitado explicitamente.
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 4. Notificar PostgREST
NOTIFY pgrst, 'reload schema';
