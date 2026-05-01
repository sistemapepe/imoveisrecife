import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { lazy, Suspense } from "react";
import BottomNav from "@/components/BottomNav";

import DynamicTheme from "@/components/DynamicTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTrafficTracker } from "@/hooks/useTrafficTracker";
import { useWebVitals } from "@/hooks/useWebVitals";

// Lazy loading rotas
const Index = lazy(() => import("./pages/Index"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Filters = lazy(() => import("./pages/Filters"));
const Contact = lazy(() => import("./pages/Contact"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookieConsent = lazy(() => import("./components/CookieConsent"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min: dados considerados frescos, sem refetch
      gcTime: 30 * 60 * 1000,   // 30 min em cache antes do garbage collect
      refetchOnWindowFocus: false, // evita refetch ao trocar de aba
      retry: 1,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  useTrafficTracker();
  useWebVitals();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/busca" element={<SearchResults />} />
          <Route path="/imovel/:id" element={<PropertyDetail />} />
          <Route path="/filtros" element={<Filters />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => {
  return (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PropertyProvider>
          <Toaster />
          <Sonner />
          <DynamicTheme />
          <BrowserRouter>
            <div className="max-w-screen-lg mx-auto relative min-h-screen">
               <AnimatedRoutes />
               
               <CookieConsent />
               <BottomNav />
            </div>
          </BrowserRouter>
        </PropertyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
  );
};

export default App;
