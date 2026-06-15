import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { getOptimizedImageUrl } from "@/lib/image-optimization";
import DrawerMenu from "./DrawerMenu";

// Rota específica do componente SearchResults (lazy loaded no App.tsx)
// Podemos dar prefetch importando manualmente o chunk
const prefetchSearchResults = () => import("@/pages/SearchResults");
const prefetchPropertyDetail = () => import("@/pages/PropertyDetail");
const prefetchFilters = () => import("@/pages/Filters");

export default function Navbar() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { settings } = useProperties();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      // Set CSS variable for dynamic height used by other sticky elements
      // Reduced heights: Normal 72px (h-18), Compact 56px (h-14)
      const height = scrolled || settings.headerStyle === 'compact' ? 56 : 72;
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };
    handleScroll(); // Initial set
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [settings.headerStyle]);

  const isCompact = settings.headerStyle === 'compact' || isScrolled;

  const handlePrefetch = useCallback((target: 'search' | 'detail' | 'filters') => {
    if (target === 'search') prefetchSearchResults();
    if (target === 'detail') prefetchPropertyDetail();
    if (target === 'filters') prefetchFilters();
  }, []);

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-4 glass-nav border-b border-card/10 max-w-screen-lg mx-auto transition-all duration-300 w-full ${
      isCompact ? 'h-[90px] py-0' : 'h-[120px] py-0'
    }`}>
      <div className="w-10 h-10 -ml-1" />

      <DrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
      
      {settings.logoUrl ? (
        <img 
          src={getOptimizedImageUrl(settings.logoUrl, { width: 540, quality: 90 })} 
          alt={settings.brandName} 
          onClick={() => navigate("/")}
          onMouseEnter={() => handlePrefetch('search')}
          onFocus={() => handlePrefetch('search')}
          className={`object-contain transition-all duration-300 cursor-pointer ${
            isCompact ? 'w-[190px] h-[98px]' : 'w-[270px] h-[140px]'
          }`}
        />
      ) : (
        <h1 
          onClick={() => navigate("/")}
          className={`font-serif font-bold tracking-widest text-accent uppercase transition-all duration-300 cursor-pointer ${
            isCompact ? 'text-xl' : 'text-2xl'
          }`}
        >
          {settings.brandName}
        </h1>
      )}
      
      {/* Espaço vazio para manter a centralização da logo */}
      <div className="w-12 h-12 -mr-3" />
    </nav>
  );
}
