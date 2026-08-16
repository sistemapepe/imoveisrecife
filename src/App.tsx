import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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

// Lazy loading rotas com prefetching inteligente
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

// Loading fallback component
const PageLoader = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));

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

function AppContent() {
  const location = useLocation();
  const { site, loading: siteLoading, error: siteError } = useSite();
  useTrafficTracker();
  useWebVitals();
  
  const isPropertyDetail = location.pathname.startsWith('/imovel/');

  if (siteLoading) return <PageLoader />;

  if (siteError || (!site && !location.pathname.includes('/admin') && !location.pathname.includes('/login'))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-luxury-dark text-card p-6 text-center">
        <Globe2 className="h-16 w-16 text-accent mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2 text-accent">Site em Configuração</h1>
        <p className="text-accent/70 max-w-md">
          {siteError || "Este domínio ainda não foi configurado em nossa plataforma."}
        </p>
        <div className="mt-8 pt-8 border-t border-white/5 w-full max-w-xs">
          <p className="text-[10px] text-accent/40 uppercase tracking-widest">Powered by Real Imob Network</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-lg mx-auto relative min-h-screen">
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
            <Route path="/network-admin" element={<ProtectedRoute><NetworkAdmin /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/plano" element={<ProjectPlan />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
