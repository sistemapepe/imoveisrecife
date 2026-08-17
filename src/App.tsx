import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { TenantProvider, useTenant } from "@/contexts/TenantContext";
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

function AppContent() {
  const location = useLocation();
  useTrafficTracker();
  useWebVitals();
  
  const isPropertyDetail = location.pathname.startsWith('/imovel/');
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();

  if (tenantLoading) {
    return <PageLoader />;
  }

  if (tenantError || !tenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Configuração não encontrada</h1>
          <p className="text-muted-foreground">
            Não foi possível identificar o site para este endereço. 
            Verifique se o domínio está configurado corretamente.
          </p>
          {tenantError && <p className="text-xs text-muted-foreground/50">{tenantError.message}</p>}
        </div>
      </div>
    );
  }

  if (tenant.status === 'maintenance') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-amber-500">Em Manutenção</h1>
          <p className="text-muted-foreground">
            O site {tenant.name} está passando por atualizações no momento. 
            Voltaremos em breve!
          </p>
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
            <Route path="/admin/*" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
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
          <TenantProvider>
            <AuthProvider>
              <PropertyProvider>
                <Suspense fallback={<PageLoader />}>
                  <DynamicTheme />
                </Suspense>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </PropertyProvider>
            </AuthProvider>
          </TenantProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
