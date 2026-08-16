import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";
import { Globe2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { SiteProvider, useSite } from "@/contexts/SiteContext";
import { lazy, Suspense } from "react";
import BottomNav from "@/components/BottomNav";
import WhatsAppFab from "@/components/WhatsAppFab";
import ScrollToTop from "@/components/ScrollToTop";
import BackButton from "@/components/BackButton";
import DynamicTheme from "@/components/DynamicTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTrafficTracker } from "@/hooks/useTrafficTracker";
import { useWebVitals } from "@/hooks/useWebVitals";
import PageLoader from "@/components/PageLoader";

// Lazy loading rotas
const Index = lazy(() => import("./pages/Index"));
const ProjectPlan = lazy(() => import("./routes/index"));
const NetworkAdmin = lazy(() => import("./pages/NetworkAdmin"));
const SearchResults = lazy(() => import("./pages/SearchResults").then(module => ({ default: module.default })));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail").then(module => ({ default: module.default })));
const Filters = lazy(() => import("./pages/Filters"));
const Contact = lazy(() => import("./pages/Contact"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookieConsent = lazy(() => import("./components/CookieConsent"));

// PageLoader is now imported from its own file

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const { site, loading: siteLoading, error: siteError } = useSite();
  useTrafficTracker();
  useWebVitals();
  
  const isPropertyDetail = location.pathname.startsWith('/imovel/');
  const isNetworkPath = location.pathname.startsWith('/network-admin');

  if (siteLoading && !isNetworkPath) return <PageLoader />;
  
  return (
    <div className="max-w-screen-lg mx-auto relative min-h-screen">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/busca" element={<SearchResults />} />
          <Route path="/imovel/:id" element={<PropertyDetail />} />
          <Route path="/filtros" element={<Filters />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/network-admin" element={<ProtectedRoute><NetworkAdmin /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/plano" element={<ProjectPlan />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      <BackButton />
      {!isPropertyDetail && <WhatsAppFab />}
      <ScrollToTop />
      <CookieConsent />
      <BottomNav />
    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <SiteProvider>
            <AuthProvider>
              <PropertyProvider>
                <Toaster />
                <Sonner />
                <DynamicTheme />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </PropertyProvider>
            </AuthProvider>
          </SiteProvider>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
