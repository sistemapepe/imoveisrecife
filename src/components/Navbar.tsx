import { useNavigate } from "react-router-dom";
import { useProperties } from "@/contexts/PropertyContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const { settings } = useProperties();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      // Set CSS variable for dynamic height used by other sticky elements
      const height = scrolled || settings.headerStyle === 'compact' ? 64 : 96;
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };
    handleScroll(); // Initial set
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [settings.headerStyle]);

  const isCompact = settings.headerStyle === 'compact' || isScrolled;

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 glass-nav border-b border-card/10 max-w-screen-lg mx-auto transition-all duration-300 ${
      isCompact ? 'h-16 py-2' : 'h-24 py-4'
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
          src={settings.logoUrl} 
          alt={settings.brandName} 
          onClick={() => navigate("/")}
          className={`object-contain transition-all duration-300 cursor-pointer ${
            isCompact ? 'h-12 max-w-[180px]' : 'h-20 max-w-[280px]'
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
      
      {/* Espaço vazio para manter a centralização da logo, já que o ícone da direita foi removido */}
      <div className="w-12 h-12 -mr-3" />
    </nav>
  );
}
