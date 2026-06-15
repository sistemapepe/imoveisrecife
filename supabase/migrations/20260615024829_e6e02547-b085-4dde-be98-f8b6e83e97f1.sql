ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS price_styles jsonb NOT NULL DEFAULT jsonb_build_object(
  'card',      jsonb_build_object('fontFamily','Manrope','fontSize',18,'fontWeight','800','color','hsl(var(--accent))'),
  'detail',    jsonb_build_object('fontFamily','Manrope','fontSize',32,'fontWeight','800','color','hsl(var(--accent))'),
  'banner',    jsonb_build_object('fontFamily','Manrope','fontSize',20,'fontWeight','700','color','hsl(var(--accent))'),
  'simulator', jsonb_build_object('fontFamily','Manrope','fontSize',24,'fontWeight','800','color','hsl(var(--accent))')
),
ADD COLUMN IF NOT EXISTS price_format jsonb NOT NULL DEFAULT jsonb_build_object(
  'prefix','R$ ',
  'suffix','',
  'decimals',0,
  'thousandsSeparator','.',
  'decimalSeparator',','
);