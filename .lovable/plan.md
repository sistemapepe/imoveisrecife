# Architectural Proposal: Multi-tenant / White-label Platform (SaaS)

This document outlines a centralized architecture to transform the project into a multi-tenant SaaS platform. The core objective is a **Single Source of Truth** where a single codebase serves multiple independent clients (tenants) via dynamic hostname routing and data isolation.

---

## 1. Database Modeling (Supabase)

The current schema already includes a `site_id` in some tables (like `site_settings` and `user_roles`). We will extend this to ensure absolute data isolation.

### Core Tables Structure
- **`tenants`**: The master registry for every site instance.
  - `id` (uuid, primary key)
  - `name` (text)
  - `slug` (text, unique) — e.g., 'empresa-a' for `empresa-a.platform.com`
  - `status` ('active', 'inactive', 'maintenance')
  - `plan_id` (uuid) — for tier-based feature gating
- **`tenant_domains`**: Maps hostnames to tenants.
  - `id` (uuid)
  - `tenant_id` (uuid, fk to tenants)
  - `hostname` (text, unique) — e.g., 'www.cliente.com.br' or 'empresa.meudominio.com'
  - `is_primary` (boolean)
  - `verification_token` (text) — for Vercel domain verification
- **`site_configs` (Evolution of `site_settings`)**: Tenant-specific branding.
  - `tenant_id` (uuid, unique)
  - `brand_name`, `logo_url`, `primary_color` (hex/hsl), `secondary_color`
  - `custom_css` (text), `json_ld_schema` (jsonb)
  - `whatsapp_number`, `social_links` (jsonb)
- **Business Data Tables** (`properties`, `leads`, `amenities`):
  - Every row MUST include a `tenant_id` column.
  - `tenant_id` will be indexed to ensure high performance.

### Security: Row Level Security (RLS)
We will implement a security-definer function to retrieve the active tenant context:
```sql
CREATE OR REPLACE FUNCTION auth.current_tenant_id() 
RETURNS uuid AS $$
  -- Logic to extract tenant_id from JWT metadata or request headers
$$ LANGUAGE sql STABLE;

CREATE POLICY "Tenant Data Isolation" ON public.properties
FOR ALL TO authenticated, anon
USING (tenant_id = auth.current_tenant_id());
```

---

## 2. Dynamic Routing & Domain Resolution

### Frontend Strategy
Instead of hardcoded site IDs, the frontend will derive context from `window.location.hostname`.

1. **Discovery Service**: A lightweight API call (or cached configuration) fetches the `tenant_id` and branding based on the hostname.
2. **Context Provider**: A `TenantProvider` wraps the app, supplying the `tenant_id` to all hooks and API calls.
3. **Fallback**: If a hostname isn't recognized, the app redirects to a generic "Not Found" or "System Maintenance" page.

### Edge Middleware (Optimization)
To avoid a "flash of unstyled content" or extra round-trips:
- **Vercel Edge Middleware**: Inspects the incoming hostname, queries Supabase (or a fast cache like Upstash/Redis), and injects the `tenant_id` as a header or cookie.
- The React app reads this header/cookie immediately on boot.

---

## 3. Vercel Domains API Integration

We will automate the "Custom Domain" experience within the Admin Panel.

### Technical Workflow
1. **Request**: User enters `www.imobiliaria-luxo.com.br` in the Admin UI.
2. **API Call**: A Supabase Edge Function calls the [Vercel Domains API](https://vercel.com/docs/rest-api/endpoints/domains#add-a-domain-to-a-project) to add the domain to the project.
3. **Verification**: The Edge Function returns the required DNS records (A, CNAME, TXT) to the user.
4. **Polling**: The UI polls the Vercel API status until the domain is "Verified" and "SSL Issued".
5. **Activation**: Once verified, the `tenant_domains` record is updated to `status: 'active'`.

---

## 4. Hierarchy & Permissions

- **Super Admin (Master)**
  - Manage all Tenants (Edit info, change plans, manually verify domains).
  - Global metrics (total properties across all sites).
  - Feature Flags (Enable "Luxury Theme" for specific tenants).
- **Tenant Admin (Local)**
  - Manage only their properties and leads.
  - Customize their specific branding and contact info.
  - Manage their own domain settings.
- **Preview Mode**
  - A specialized route `/admin/preview?token=...` that allows a Tenant Admin to view their site with "Draft" changes without affecting the live public domain.

---

## 5. Roadmap

### Phase 1: Foundation (DB & Isolation)
- Rename `site_id` to `tenant_id` across the database (or alias it).
- Update RLS policies to be strictly `tenant_id` scoped.
- Implement `TenantContext` in the React frontend.

### Phase 2: Dynamic Routing & Fallback
- Implement hostname-based tenant discovery.
- Create global theme injection (CSS variables mapping from DB).
- Build the "Site Inactive" / "Maintenance" fallback views.

### Phase 3: Domain & Vercel API
- Build the Vercel Integration Edge Function.
- Create the "Domain Management" tab in the Admin.
- Implement real-time DNS status checks.

### Phase 4: Super Admin & Scaling
- Develop the Master Dashboard for the platform owner.
- Implement multi-tenant storage (isolated buckets/folders per tenant).
- Add "Preview/Draft" vs "Published" state for site configurations.

---

*This is a high-level architectural overview. No code has been modified. Please review and provide feedback or approval to proceed with Phase 1.*