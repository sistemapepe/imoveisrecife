# Architectural Proposal: Multi-tenant / White-label Platform

This plan outlines the transformation of the current project into a centralized multi-tenant architecture, allowing multiple "tenants" (real estate clients) to operate from a single codebase with isolated data and custom branding.

## 1. Core Architecture Overview

We will move from a single-site model to a **Single-Database Multi-tenant** approach.

### Database Strategy (Supabase)
- **Tenant Isolation**: Every client-facing table (properties, messages, settings, users) will include a `site_id` (UUID).
- **RLS (Row Level Security)**: Strict policies will ensure that a user or a public visitor only sees data where `site_id` matches their current context.
- **Shared Master Tables**: Tables like `site_configs` will store domain mappings, logos, and custom CSS variables for each tenant.

### Routing & Discovery
- **Tenant Identification**: The application will identify the tenant based on the `window.location.hostname`.
- **Domain Mapping**: A master table `site_domains` will map custom domains (e.g., `imobiliaria-a.com.br`) or subdomains to a specific `site_id`.
- **Dynamic Configuration**: A global `SiteProvider` will fetch the configuration (colors, logo, features enabled) for the identified `site_id` on app load.

## 2. Implementation Phases

### Phase 1: Foundation & Data Isolation
- Standardize the `site_id` column across all relevant tables.
- Refactor Supabase RLS policies to use a `current_site_id()` function that derives the tenant from the session or request context.
- Implement the `SiteContext` to handle tenant discovery via hostname.

### Phase 2: Centralized Super Admin
- Create a `Super Admin` dashboard (accessible only to master users).
- Features: Create new tenants, manage domain mappings, monitor global analytics, and toggle premium features per site.
- Automated onboarding: A script to seed a new tenant with default settings and roles.

### Phase 3: Dynamic Branding & Customization
- Replace hardcoded styles with CSS Variables (already partially implemented) driven by the `site_configs` table.
- Support for custom assets (logos, favicons, OG images) stored in tenant-specific storage buckets or folders.
- DNS Management: Documentation/tools for clients to point CNAME records to the central platform.

## 3. Benefits of this Approach
- **Single Source of Truth**: One repository. A bug fix in the search logic benefits 100% of clients instantly.
- **Scalability**: Adding a new client is a database row insertion, not a code deployment.
- **Operational Efficiency**: Centralized billing, support, and monitoring.

## 4. Risks & Considerations
- **Global Failure**: A deployment error affects all clients. (Mitigation: Strong E2E testing and staged rollouts).
- **Performance**: As the database grows, indexes on `site_id` become critical.
- **Custom Code Requests**: Tenants may ask for unique features. (Mitigation: Feature-flag architecture to enable/disable modules per site).

---
**Next Step**: Please review this plan. Upon approval, I will begin by documenting the specific schema changes required for the `site_id` standardization.
