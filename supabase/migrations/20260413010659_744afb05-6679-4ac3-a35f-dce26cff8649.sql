-- Add available_amenities column to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN available_amenities text[] NOT NULL DEFAULT ARRAY[
  'Piscina', 'Churrasqueira', 'Academia', 'Sauna', 'Jardim', 'Elevador', 
  'Varanda Gourmet', 'Playground', 'Salão de Festas', 'Segurança 24h', 
  'Quadra Esportiva', 'Spa', 'Home Cinema', 'Adega', 'Lavabo'
]::text[];

-- Fix: restrict role_permissions SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.role_permissions;
CREATE POLICY "Admins and role owners can view permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = role_permissions.role
  )
);
