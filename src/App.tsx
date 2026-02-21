import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PropertyProvider } from "@/contexts/PropertyContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import PropertyDetail from "./pages/PropertyDetail";
import Filters from "./pages/Filters";
import Contact from "./pages/Contact";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PropertyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="max-w-md mx-auto relative min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/busca" element={<SearchResults />} />
              <Route path="/imovel/:id" element={<PropertyDetail />} />
              <Route path="/filtros" element={<Filters />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </PropertyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
