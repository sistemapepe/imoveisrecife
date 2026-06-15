
-- Backend validation trigger for properties (defense in depth)
CREATE OR REPLACE FUNCTION public.validate_property_before_save()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.title IS NULL OR length(btrim(NEW.title)) = 0 THEN
    RAISE EXCEPTION 'validation_error: title é obrigatório';
  END IF;
  IF NEW.type IS NULL OR length(btrim(NEW.type)) = 0 THEN
    RAISE EXCEPTION 'validation_error: type é obrigatório';
  END IF;
  IF NEW.category IS NULL OR length(btrim(NEW.category)) = 0 THEN
    RAISE EXCEPTION 'validation_error: category é obrigatório';
  END IF;
  IF NEW.address IS NULL OR length(btrim(NEW.address)) = 0 THEN
    RAISE EXCEPTION 'validation_error: address é obrigatório';
  END IF;
  IF NEW.neighborhood IS NULL OR length(btrim(NEW.neighborhood)) = 0 THEN
    RAISE EXCEPTION 'validation_error: neighborhood é obrigatório';
  END IF;
  IF NEW.city IS NULL OR length(btrim(NEW.city)) = 0 THEN
    RAISE EXCEPTION 'validation_error: city é obrigatório';
  END IF;
  IF NEW.price IS NULL OR NEW.price <= 0 THEN
    RAISE EXCEPTION 'validation_error: price deve ser > 0';
  END IF;
  IF NEW.area IS NULL OR NEW.area <= 0 THEN
    RAISE EXCEPTION 'validation_error: area deve ser > 0';
  END IF;
  IF NEW.bedrooms IS NULL OR NEW.bedrooms <= 0 THEN
    RAISE EXCEPTION 'validation_error: bedrooms deve ser > 0';
  END IF;
  IF NEW.bathrooms IS NULL OR NEW.bathrooms <= 0 THEN
    RAISE EXCEPTION 'validation_error: bathrooms deve ser > 0';
  END IF;
  IF NEW.parking IS NULL OR NEW.parking <= 0 THEN
    RAISE EXCEPTION 'validation_error: parking deve ser > 0';
  END IF;
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('disponivel','reservado','vendido') THEN
    RAISE EXCEPTION 'validation_error: status inválido (use disponivel|reservado|vendido)';
  END IF;
  IF NEW.images IS NULL OR array_length(NEW.images, 1) IS NULL THEN
    RAISE EXCEPTION 'validation_error: ao menos 1 imagem é obrigatória';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_property_before_save ON public.properties;
CREATE TRIGGER trg_validate_property_before_save
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.validate_property_before_save();

-- Allow linking re-process imports to a parent
ALTER TABLE public.import_history
  ADD COLUMN IF NOT EXISTS parent_import_id uuid REFERENCES public.import_history(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reprocess boolean NOT NULL DEFAULT false;
