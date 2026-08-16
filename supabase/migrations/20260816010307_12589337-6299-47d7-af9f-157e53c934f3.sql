
-- Tabela de configurações globais da rede
CREATE TABLE IF NOT EXISTS public.network_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.network_settings TO authenticated;
GRANT ALL ON public.network_settings TO service_role;

-- RLS
ALTER TABLE public.network_settings ENABLE ROW LEVEL SECURITY;

-- Apenas Super Admins podem ver e editar configurações globais
CREATE POLICY "Super Admins can manage network settings"
ON public.network_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin')); -- O sistema usa 'admin' no app_role para o que chamamos de Super Admin no contexto global

-- Inserir configurações iniciais (se não existirem)
INSERT INTO public.network_settings (key, value, description)
VALUES 
('theme_defaults', '{"primary": "#D4AF37", "background": "#0A0A0A", "accent": "#D4AF37"}', 'Cores padrão para novos sites'),
('resource_limits', '{"max_properties_per_site": 100, "max_users_per_site": 5}', 'Limites de recursos padrão')
ON CONFLICT (key) DO NOTHING;
