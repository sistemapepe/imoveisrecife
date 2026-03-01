-- Add unique property code column
ALTER TABLE public.properties ADD COLUMN code text UNIQUE;

-- Create function to auto-generate property code on insert
CREATE OR REPLACE FUNCTION public.generate_property_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code text;
  seq int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 5) AS integer)), 0) + 1
  INTO seq
  FROM public.properties
  WHERE code IS NOT NULL AND code LIKE 'JHR-%';
  
  new_code := 'JHR-' || LPAD(seq::text, 4, '0');
  NEW.code := new_code;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER set_property_code
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  WHEN (NEW.code IS NULL)
  EXECUTE FUNCTION public.generate_property_code();

-- Backfill existing properties
DO $$
DECLARE
  r RECORD;
  seq int := 0;
BEGIN
  FOR r IN SELECT id FROM public.properties WHERE code IS NULL ORDER BY created_at ASC
  LOOP
    seq := seq + 1;
    UPDATE public.properties SET code = 'JHR-' || LPAD(seq::text, 4, '0') WHERE id = r.id;
  END LOOP;
END;
$$;

-- Now make it NOT NULL after backfill
ALTER TABLE public.properties ALTER COLUMN code SET NOT NULL;