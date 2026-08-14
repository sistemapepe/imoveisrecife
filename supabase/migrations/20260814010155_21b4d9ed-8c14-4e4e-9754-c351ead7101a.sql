BEGIN;

-- 1. Create sites table
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT UNIQUE NOT NULL,
    brand_name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT SELECT ON public.sites TO anon;
GRANT ALL ON public.sites TO service_role;

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Super admins can manage sites" ON public.sites FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- 2. Create the default site instance (migration of current data)
DO $$
DECLARE
    v_default_site_id UUID;
    v_domain TEXT := 'localhost'; -- Default domain
BEGIN
    -- Check if we already have a site
    SELECT id INTO v_default_site_id FROM public.sites WHERE domain = v_domain LIMIT 1;
    
    IF v_default_site_id IS NULL THEN
        INSERT INTO public.sites (domain, brand_name) 
        VALUES (v_domain, 'Imóveis Recife')
        RETURNING id INTO v_default_site_id;
    END IF;

    -- 3. Add site_id column to tables
    -- properties
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='properties' AND column_name='site_id') THEN
        ALTER TABLE public.properties ADD COLUMN site_id UUID REFERENCES public.sites(id);
        UPDATE public.properties SET site_id = v_default_site_id WHERE site_id IS NULL;
    END IF;

    -- site_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='site_settings' AND column_name='site_id') THEN
        ALTER TABLE public.site_settings ADD COLUMN site_id UUID REFERENCES public.sites(id);
        UPDATE public.site_settings SET site_id = v_default_site_id WHERE site_id IS NULL;
        ALTER TABLE public.site_settings ADD CONSTRAINT unique_site_settings_per_site UNIQUE (site_id);
    END IF;

    -- contact_messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='contact_messages' AND column_name='site_id') THEN
        ALTER TABLE public.contact_messages ADD COLUMN site_id UUID REFERENCES public.sites(id);
        UPDATE public.contact_messages SET site_id = v_default_site_id WHERE site_id IS NULL;
    END IF;

    -- performance_logs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='performance_logs' AND column_name='site_id') THEN
        ALTER TABLE public.performance_logs ADD COLUMN site_id UUID REFERENCES public.sites(id);
        UPDATE public.performance_logs SET site_id = v_default_site_id WHERE site_id IS NULL;
    END IF;
    
    -- role_permissions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='role_permissions' AND column_name='site_id') THEN
        ALTER TABLE public.role_permissions ADD COLUMN site_id UUID REFERENCES public.sites(id);
        UPDATE public.role_permissions SET site_id = v_default_site_id WHERE site_id IS NULL;
    END IF;

    -- user_roles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='user_roles' AND column_name='site_id') THEN
        ALTER TABLE public.user_roles ADD COLUMN site_id UUID REFERENCES public.sites(id);
        UPDATE public.user_roles SET site_id = v_default_site_id WHERE site_id IS NULL;
    END IF;

END $$;

COMMIT;