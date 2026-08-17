-- Phase 1: Foundation and Data Isolation

-- 1. Create Tenant Status Type
DO $$ BEGIN
    CREATE TYPE public.tenant_status AS ENUM ('active', 'inactive', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Domain Status Type
DO $$ BEGIN
    CREATE TYPE public.domain_status AS ENUM ('pending', 'active', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status public.tenant_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;
GRANT SELECT ON public.tenants TO anon;
GRANT ALL ON public.tenants TO service_role;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 4. Create Tenant Domains Table
CREATE TABLE IF NOT EXISTS public.tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    hostname TEXT UNIQUE NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    status public.domain_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenant_domains TO authenticated;
GRANT SELECT ON public.tenant_domains TO anon;
GRANT ALL ON public.tenant_domains TO service_role;

ALTER TABLE public.tenant_domains ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function for RLS (Contextual Tenant ID)
-- This function will evolve to use custom JWT claims later
CREATE OR REPLACE FUNCTION public.get_tenant_id_by_hostname(_hostname TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM tenant_domains WHERE hostname = _hostname LIMIT 1;
$$;

-- 6. RLS Policies
CREATE POLICY "Anyone can read active tenants" ON public.tenants
FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can read tenant domains" ON public.tenant_domains
FOR SELECT USING (true);

-- Super admins can do anything (assuming Super Admin logic exists in user_roles)
CREATE POLICY "Super admins can manage tenants" ON public.tenants
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage domains" ON public.tenant_domains
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 7. Migrate existing site_settings to tenants (Basic Mapping)
-- Assuming site_id in site_settings is what we want to use as tenant_id
DO $$
DECLARE
    site_rec RECORD;
    new_tenant_id UUID;
BEGIN
    FOR site_rec IN SELECT DISTINCT site_id FROM public.site_settings WHERE site_id IS NOT NULL LOOP
        -- Check if tenant already exists
        IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = site_rec.site_id) THEN
            INSERT INTO public.tenants (id, name, slug)
            VALUES (site_rec.site_id, 'Site ' || site_rec.site_id, 'site-' || site_rec.site_id)
            ON CONFLICT (id) DO NOTHING;
        END IF;
    END LOOP;
END $$;
