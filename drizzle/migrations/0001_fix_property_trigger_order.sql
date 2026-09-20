-- site_id must be set before the code is generated (triggers fire in name order)
DROP TRIGGER IF EXISTS set_property_code ON public.properties;
CREATE TRIGGER trg_zz_set_property_code
BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.generate_property_code();
