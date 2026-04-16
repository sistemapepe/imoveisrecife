-- Tighten public INSERT policy on property_views
DROP POLICY IF EXISTS "Anyone can log a view" ON public.property_views;

CREATE POLICY "Anyone can log a view"
ON public.property_views
FOR INSERT
TO public
WITH CHECK (
  length(ip_hash) <= 128
  AND (viewer_id IS NULL OR viewer_id = auth.uid())
);