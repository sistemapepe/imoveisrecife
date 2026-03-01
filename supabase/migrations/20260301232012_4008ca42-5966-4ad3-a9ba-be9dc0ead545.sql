
CREATE OR REPLACE FUNCTION public.generate_property_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  seq int;
  prefix text;
BEGIN
  SELECT UPPER(LEFT(brand_name, 3)) INTO prefix FROM public.site_settings LIMIT 1;
  IF prefix IS NULL OR prefix = '' THEN
    prefix := 'IMO';
  END IF;
  -- Remove accents
  prefix := translate(prefix, 'ÀÁÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'AAAAAEEEEIIIIOOOOOÜUUUUC');

  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM LENGTH(prefix) + 2) AS integer)), 0) + 1
  INTO seq
  FROM public.properties
  WHERE code IS NOT NULL AND code LIKE prefix || '-%';
  
  new_code := prefix || '-' || LPAD(seq::text, 4, '0');
  NEW.code := new_code;
  RETURN NEW;
END;
$function$;
