# Project Audit and Stability Plan

This plan addresses a comprehensive deep-technical audit of the real estate application to ensure stability, performance, and multi-tenant isolation across mobile and desktop.

## Audit Findings & Goals

1.  **Multi-Tenant Isolation**: Ensure `site_id` is consistently applied to all database operations (RLS) and frontend contexts.
2.  **Performance Optimization**: Refine caching strategies and reduce unnecessary re-renders.
3.  **UI/UX Stability**: Fix navigation loops, hydration warnings, and mobile interaction issues (touch debouncing, safe areas).
4.  **Error Resilience**: Improve error handling in asynchronous flows (auth, data fetching).
5.  **SEO & Metadata**: Ensure dynamic meta tags correctly reflect site-specific branding.

## Technical Details

### 1. Multi-Tenant Scoping (RLS & Data API)
-   **Properties & Settings**: Verify `site_id` is present in all `public.properties` and `public.site_settings` operations.
-   **Analytics & Traffic**: Ensure `traffic_events` and `performance_logs` are correctly scoped to the current tenant.
-   **Security**: Validate that `super_admin` role properly bypasses tenant restrictions where intended (e.g., in `NetworkAdmin`).

### 2. Frontend Performance & Stability
-   **Context Caching**: Extend `PropertyContext` and `SiteContext` caching (sessionStorage/localStorage) to minimize DB lookups.
-   **Lazy Loading**: Ensure all heavy admin tabs and secondary routes use `React.lazy` with appropriate skeletons.
-   **Page Transitions**: Fine-tune `Framer Motion` settings to avoid layout shifts and hydration mismatches.
-   **Image Optimization**: Verify `srcSet` generation and lazy loading for property galleries.

### 3. Mobile Experience
-   **Viewport Refinements**: Enforce `env(safe-area-inset-bottom)` across all fixed footers and CTAs.
-   **Touch Interactions**: Standardize the use of `useMobileInteractions` to prevent phantom clicks.
-   **Input Handling**: Prevent auto-zoom on mobile forms by ensuring `font-size: 16px` on inputs.

### 4. Code Quality & Observability
-   **Logging**: Standardize logging via `logger.ts` to include `site_id` and `requestId` for all critical operations.
-   **Error Boundaries**: Add React Error Boundaries around complex modules (e.g., `Analytics`, `BulkImport`).

## Implementation Plan

1.  **Phase 1: Database & RLS Hardening**
    -   Audit all migrations to ensure `GRANT` statements and `site_id` scoping are correct.
    -   Fix the `traffic_events` scoping issue (missing `site_id` check in some queries).
2.  **Phase 2: Authentication & Routing Stability**
    -   Refactor `AuthContext` to be more resilient during multi-tenant resolution.
    -   Fix login/redirection loops reported in the `NetworkAdmin` panel.
3.  **Phase 3: Performance & Mobile UX Refinement**
    -   Implement aggressive caching for static site settings.
    -   Apply safe-area and touch fixes to all property detail components.
4.  **Phase 4: Global Verification**
    -   Run a full scan for console errors and hydration warnings.
    -   Verify SEO meta tags in social sharing environments.
