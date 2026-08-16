# Plan - User Role Control System Expansion

Expand the existing RBAC (Role-Based Access Control) system to include a "Super Admin" role and ensure all menu items in the Admin panel are gated by granular permissions that can be managed by the Super Admin.

## User Review Required

> [!IMPORTANT]
> The current system already has "Admin", "Supervisor", and "Corretor". I will rename "Admin" to "Super Admin" and ensure "Supervisor" and "Corretor" only see what is permitted.

## Proposed Changes

### Database (Supabase)
- Update `app_role` enum to include `super_admin`.
- Ensure `role_permissions` table exists and covers all current Admin tabs.
- Set up initial permissions where only `super_admin` has access to user management and critical settings.

### Authentication Context
- Update `AuthContext.tsx` to handle the new `super_admin` role.
- Map granular permissions from the database to application-level flags (`canViewProperties`, `canManageUsers`, etc.).

### Admin Panel
- Ensure every tab (Dashboard, Properties, Import, Messages, Visits, Analytics, Traffic, SEO, Team, Settings, Bucket, LGPD) is correctly gated by the relevant permission flag.
- Improve the "Team" tab to allow a Super Admin to toggle permissions for other roles (Supervisor, Corretor) in real-time.

### Permissions Mapping
- **Dashboard**: `view_analytics`
- **Properties**: `view_properties` / `manage_properties`
- **Import**: `bulk_import`
- **Messages**: `view_contacts`
- **Visits**: `view_visits`
- **Analytics**: `view_analytics`
- **Traffic**: `view_traffic`
- **SEO**: `manage_seo`
- **Team**: `manage_users` (Only Super Admin)
- **Settings**: `manage_settings`
- **Bucket**: `manage_bucket`
- **LGPD**: `manage_privacy`

## Technical Details

- **Supabase Migration**: Add `super_admin` to `app_role` enum and migrate existing `admin` users to `super_admin` if necessary.
- **Role Permissions**: Ensure the `role_permissions` table is the source of truth for Supervisor and Corretor access.
- **React Components**: 
  - `Admin.tsx`: Update `visibleTabs` logic.
  - `PermissionsConfig.tsx`: Ensure it displays all 13 permission keys.
  - `ProtectedRoute.tsx`: Update to allow `super_admin`, `supervisor`, and `corretor` (base access), but specific tabs will still be gated inside the Admin component.
