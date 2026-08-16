# UI/UX Overhaul Plan - Modern & Premium Real Estate System

This plan details a deep visual and experience upgrade across the entire application, focusing on a premium, modern, and highly intuitive interface without altering existing functionalities.

## User Experience (UX) Improvements
- **Refined Navigation**: Standardize the sidebar and mobile bottom navigation for maximum clarity and consistency.
- **Improved Information Architecture**: Optimize spacing and grouping of elements in the admin and network panels to reduce cognitive load.
- **Enhanced Feedbacks**: Implement skeleton loaders for all data-heavy components and standardize success/error/loading states using premium animations.
- **Micro-interactions**: Add subtle hover effects, smooth layout transitions, and interactive feedback for all buttons and cards.

## User Interface (UI) Improvements
- **Modern Color Palette**: Enforce the "Luxury Dark" theme with gold accents consistently using semantic design tokens.
- **Typography & Hierarchy**: Improve readability by standardizing font sizes, weights, and line heights. Use serif fonts for headings and clean sans-serif for body text.
- **Premium Components**: Upgrade cards, buttons, and inputs with glassmorphism effects, subtle borders, and consistent corner radii (e.g., `rounded-2xl` or `rounded-3xl`).
- **Responsive Layouts**: Ensure all views are optimized for mobile, tablet, and desktop, using `safe-area-inset` for mobile devices.

## Technical Implementation Details
- **CSS Variables**: Use and extend semantic HSL tokens in `index.css` for consistent theming.
- **Framer Motion**: Reintroduce light and stable animations for page transitions and element entries (avoiding ref conflicts).
- **Lucide Icons**: Standardize icon sizes and colors for better visual rhythm.
- **Component Refactoring**: Audit shared UI components in `src/components/ui` to ensure they follow the new design system.

## Proposed Changes

### Core UI Framework
- Audit and update `index.css` with a refined premium palette.
- Standardize spacing utility usage (`gap`, `p`, `m`) across all layouts.

### Global Components
- **Navbar/Sidebar**: Enhance with glassmorphism and gold accents.
- **Footer**: Refine typography and Crece/UF display.
- **Property Cards**: Standardize the 5-stat grid and image overlays.

### Page Specifics
- **Index/Home**: Enhance hero section and search bar layout.
- **Admin & Network Admin**: Streamline dashboard widgets and tables.
- **Property Detail**: Improve POI sections and interactive map integration.
