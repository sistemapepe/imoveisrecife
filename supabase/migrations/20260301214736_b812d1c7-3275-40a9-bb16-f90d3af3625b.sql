
-- Table to store configurable permissions per role
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  UNIQUE (role, permission)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read permissions (needed for frontend)
CREATE POLICY "Authenticated users can view permissions"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert permissions"
  ON public.role_permissions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update permissions"
  ON public.role_permissions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete permissions"
  ON public.role_permissions FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default permissions for supervisor
INSERT INTO public.role_permissions (role, permission, enabled) VALUES
  ('supervisor', 'view_properties', true),
  ('supervisor', 'manage_properties', true),
  ('supervisor', 'view_contacts', true),
  ('supervisor', 'manage_settings', false),
  ('supervisor', 'manage_users', false);

-- Insert default permissions for corretor
INSERT INTO public.role_permissions (role, permission, enabled) VALUES
  ('corretor', 'view_properties', true),
  ('corretor', 'manage_properties', false),
  ('corretor', 'view_contacts', false),
  ('corretor', 'manage_settings', false),
  ('corretor', 'manage_users', false);
