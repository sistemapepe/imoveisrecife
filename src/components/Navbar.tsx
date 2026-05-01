import { useNavigate } from "react-router-dom";
import { useProperties } from "@/contexts/PropertyContext";
import { useEffect, useState } from "react";
import { getOptimizedImageUrl } from "@/lib/image-optimization";

export default function Navbar() {
  const navigate = useNavigate();
  const { settings } = useProperties();
  const [isScrolled, setIsScrolled] = useState(false);
  
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

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 glass-nav border-b border-card/10 max-w-screen-lg mx-auto transition-all duration-300 ${
      isCompact ? 'h-14 py-2' : 'h-18 py-3'
    }`}>
      <button 
        onClick={() => navigate("/admin")} 
        className="text-accent w-12 h-12 flex items-center justify-center -ml-3 hover:bg-card/5 rounded-full transition-colors"
        aria-label="Menu Admin"
      >
        <span className="text-2xl leading-none">☰</span>
      </button>
      
      {settings.logoUrl ? (
        <img 
          src={getOptimizedImageUrl(settings.logoUrl, { width: isCompact ? 320 : 480, quality: 90 })} 
          alt={settings.brandName} 
          onClick={() => navigate("/")}
          className={`object-contain transition-all duration-300 cursor-pointer ${
            isCompact ? 'h-10 max-w-[160px]' : 'h-14 max-w-[240px]'
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
