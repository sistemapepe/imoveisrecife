## Objetivo
Reduzir ainda mais o espaço entre a logo (navbar) e o banner amarelo (marquee), garantir alinhamento idêntico em desktop e mobile, e expor controles editáveis no admin para esses blocos sem precisar mexer no código.

## Mudanças

### 1. Layout (frontend)
- `src/components/Navbar.tsx`
  - Remover `border-b` e reduzir altura para encostar no banner: `h-[80px]` (compacto) / `h-[100px]` (expandido), `py-0`.
  - Logo controlada por variáveis CSS (ver item 3): `width: var(--logo-w)`, `height: var(--logo-h)`.
- `src/components/MarqueeBanner.tsx`
  - Padding vertical controlado por variável: `py-[var(--marquee-py)]` (default `4px`).
  - Remover `border-b` redundante e manter apenas a borda inferior fina do próprio banner.
- `src/pages/Index.tsx`
  - Garantir que `<MarqueeBanner />` fica colado em `<Navbar />` (sem margens entre eles).

### 2. Banco de dados
Migração adicionando colunas a `public.site_settings` (todas com defaults, NOT NULL):
- `navbar_height_px` integer default `100`
- `logo_width_px` integer default `270`
- `logo_height_px` integer default `140`
- `marquee_padding_y_px` integer default `4`

### 3. Aplicação das variáveis CSS
- `src/components/DynamicTheme.tsx`: injetar `--logo-w`, `--logo-h`, `--navbar-h`, `--marquee-py` no `:root` a partir de `settings`.
- Atualizar `Navbar` e `MarqueeBanner` para consumir essas variáveis. No mobile a logo escala automaticamente respeitando `max-width: 100%` para nunca ultrapassar a navbar.

### 4. Admin UI
- Novo card "Cabeçalho & Banner" em `src/components/admin/SettingsTab.tsx` com 4 inputs numéricos (sliders) para os campos acima, salvando em `site_settings`.
- Pré-visualização imediata via DynamicTheme (já reativo ao contexto).

### 5. Contexto/Tipos
- `src/contexts/PropertyContext.tsx`: incluir os novos campos no mapeamento `settings` (camelCase).
- `src/integrations/supabase/types.ts`: gerado automaticamente pela migração.

## Detalhes técnicos
- Responsividade: usar `clamp()` no CSS — `width: clamp(140px, var(--logo-w), 90vw)` para garantir que a logo encolha em telas estreitas.
- O banner herda a largura total da navbar (mesmo `max-w-screen-lg mx-auto`), então o alinhamento horizontal já é idêntico em mobile/desktop. A correção do alinhamento vertical (vão) vem da redução do `py` da navbar para `0` + controle de altura da logo via variável.
- Sem alteração nas RLS (colunas adicionadas em tabela já políticada).
