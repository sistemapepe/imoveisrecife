-- 1. Apagar e recriar a tabela para garantir que não existam restrições ocultas
DROP TABLE IF EXISTS public.role_permissions;

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role public.app_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT true,
    UNIQUE(role, permission)
);

-- 2. Garantir privilégios
GRANT ALL ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

-- 3. Habilitar RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Criar política ultra simples
CREATE POLICY "allow_all_auth" ON public.role_permissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
