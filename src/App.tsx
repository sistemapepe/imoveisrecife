import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import BottomNav from "@/components/BottomNav";
import WhatsAppFab from "@/components/WhatsAppFab";
import DynamicTheme from "@/components/DynamicTheme";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import PropertyDetail from "./pages/PropertyDetail";
import Filters from "./pages/Filters";
import Contact from "./pages/Contact";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookieConsent from "./components/CookieConsent";
import { useTrafficTracker } from "@/hooks/useTrafficTracker";

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
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/busca" element={<SearchResults />} />
        <Route path="/imovel/:id" element={<PropertyDetail />} />
        <Route path="/filtros" element={<Filters />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
               <WhatsAppFab />
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
