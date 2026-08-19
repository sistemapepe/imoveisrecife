# SEO Optimization Plan

Perform a comprehensive SEO sweep to improve Google ranking, indexing, and user experience (Core Web Vitals).

## Proposed Changes

### 1. Semantic HTML & Accessibility Refinements
- **Search Results & Favorites**: Ensure `h1` is unique and relevant. Update breadcrumb navigation for better crawlability.
- **Components**: Add `aria-current` to active navigation links. Improve `alt` text descriptions dynamically.
- **Image Optimization**: Ensure all images have appropriate `width` and `height` attributes to prevent CLS (Cumulative Layout Shift).

### 2. Structured Data (JSON-LD) Enhancements
- **BreadcrumbList**: Standardize breadcrumbs across all pages for Google's "Rich Results".
- **RealEstateListing**: Refine property detail schema to include more attributes (building name, energy rating if applicable).
- **FAQ Schema**: Add FAQ schema to the home page or contact page to capture more SERP real estate.

### 3. Meta & Head Optimizations
- **Index.html**: Optimize the static fallback title and description for times when JavaScript is not yet loaded.
- **SEOHead**: Add `twitter:site` and `twitter:creator` tags. Ensure canonical URLs always use the absolute production domain if configured in settings.

### 4. Site Architecture & Performance
- **Sitemap**: Ensure the Supabase Edge Function sitemap is correctly referenced in `robots.txt` (if not already) and `index.html`.
- **Preconnect/Preload**: Add `preconnect` hints for Supabase and Google Fonts to speed up initial connection.

## Technical Details
- Update `src/components/SEOHead.tsx` to handle more structured data types.
- Modify `index.html` to add preconnect hints and refine static meta tags.
- Update `src/pages/SearchResults.tsx` and `src/pages/Favorites.tsx` for better header hierarchy.
- Refine `src/components/Footer.tsx` to include internal links for better link equity distribution.
- Ensure `src/components/Navbar.tsx` and `src/components/BottomNav.tsx` use semantic `<nav>` and appropriate ARIA roles.
