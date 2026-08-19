# Plan - Fix Database Security and RLS Vulnerabilities

Fix critical and warning security findings related to multi-tenancy, data exposure, and function execution permissions.

## Proposed Changes

### 1. Fix Multi-Tenant Data Leakage (Critical)
- **Problem**: `has_role()` only checks user and role, allowing admins of one site to access data from all other sites.
- **Fix**: Update `has_role()` to optionally accept a `_site_id`. If provided, it must match the `site_id` in `user_roles`.
- **Implementation**: 
    - Modify `public.has_role(_user_id uuid, _role app_role, _site_id uuid DEFAULT NULL)` function.
    - Update all RLS policies that use `has_role()` to pass the row's `site_id`.
    - Tables to update: `properties`, `site_settings`, `role_permissions`, `contact_messages`, `visit_requests`, `property_views`, `traffic_events`, `import_history`, `performance_logs`.

### 2. Restrict Role Permissions Visibility (Warning)
- **Problem**: `role_permissions` policy matches by role name only, not `site_id`.
- **Fix**: Update the `SELECT` policy on `role_permissions` to ensure the matching `user_roles` record also has the same `site_id` as the `role_permissions` row.

### 3. Mask Sensitive Site Data (Warning)
- **Problem**: `Allow public read-only access to sites` policy exposes `owner_id` (UUID) and internal metadata.
- **Fix**: 
    - Option A: Restrict the RLS policy to specific columns (not possible in standard Supabase RLS `SELECT` policy).
    - Option B: Create a secure view `public.sites_public` and grant access to it instead, or keep RLS but ensure sensitive fields like `owner_id` are handled carefully in the frontend. 
    - **Preferred Fix**: Update the RLS policy to be more restrictive and ensure the application only fetches required fields.

### 4. Secure SECURITY DEFINER Functions (Warning)
- **Problem**: `has_role` and `is_super_admin` are `SECURITY DEFINER` and executable by `public` (anon/authenticated).
- **Fix**: Revoke `EXECUTE` on these functions from `public` and `anon`. Grant `EXECUTE` only to `authenticated` or specific roles if needed, or keep them `SECURITY DEFINER` but ensure they are only called from within other secure contexts (like RLS policies).

## Technical Details

### SQL Migration
1. `DROP FUNCTION public.has_role(uuid, app_role);`
2. `CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _site_id uuid DEFAULT NULL) ...`
3. Redefine RLS policies for:
   - `properties`: `USING (has_role(auth.uid(), 'admin', site_id) OR ...)`
   - `site_settings`: `USING (has_role(auth.uid(), 'admin', site_id))`
   - `role_permissions`: `USING (has_role(auth.uid(), 'admin', site_id) OR (EXISTS ... AND ur.site_id = role_permissions.site_id))`
   - (Similar for other tables)
4. `REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM public, anon;`
5. `REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM public, anon;`
