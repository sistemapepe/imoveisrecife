# Architectural Plan: Multi-tenant / White-label Platform (Phase 1)

This plan initiates the transformation of the application into a multi-tenant SaaS platform. Phase 1 focuses on the database foundation and data isolation (RLS).

## 1. Database Foundation (Supabase Migration)

Create the core multi-tenant structure without breaking existing `site_id` logic.

### New Tables
- **`tenants`**: The master registry for every site instance.
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `slug` (text, unique, not null)
  - `status` ('active', 'inactive', 'maintenance')
  - `created_at`, `updated_at`
- **`tenant_domains`**: Maps hostnames to tenants.
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, foreign key to tenants)
  - `hostname` (text, unique, not null)
  - `is_primary` (boolean, default false)
  - `status` ('pending', 'active', 'failed')

### RLS & Security
- Enable RLS on all new tables.
- Create a `auth.current_tenant_id()` function to securely resolve the active tenant context.
- Implement initial isolation policies for `tenants` and `tenant_domains`.

## 2. Frontend Adaptation (Foundation)

Prepare the application to resolve tenant context dynamically.

- **`src/contexts/TenantContext.tsx`**: A new context provider that resolves the `tenant_id` based on `window.location.hostname`.
- **`src/hooks/useTenant.ts`**: Hook to access tenant configuration and identity across the app.
- **`src/App.tsx`**: Integrate `TenantProvider` at the root level.

## 3. Data Migration (Internal)

- Map existing `site_settings` entries to new `tenants` records to preserve current site data.
- Ensure `site_id` (existing) and `tenant_id` (new) coexist during the transition period.

## Technical Details

- **RLS Helper**:
  ```sql
  CREATE OR REPLACE FUNCTION auth.current_tenant_id()
  RETURNS uuid AS $$
    SELECT id FROM public.tenants WHERE slug = current_setting('app.current_tenant_slug', true)::text OR id = current_setting('app.current_tenant_id', true)::uuid;
  $$ LANGUAGE sql STABLE;
  ```
  *(Note: Final implementation will likely use a mix of JWT claims and runtime settings).*

- **Dynamic Theming**: The `TenantContext` will eventually replace or augment `DynamicTheme.tsx` to handle branding based on the resolved tenant.

---

### Phase 1 Approval
This plan covers ONLY the foundation (Phase 1 of the larger architecture). 
"Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required."
- ok aprovado
