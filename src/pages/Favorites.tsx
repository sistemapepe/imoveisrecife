import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useProperties } from "@/contexts/PropertyContext";
import PropertyCard from "@/components/PropertyCard";

import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Favorites() {
  const navigate = useNavigate();
  const { properties, favorites } = useProperties();
  const favProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <>
      <SEOHead title="Favoritos" description="Seus imóveis favoritos salvos para consulta rápida." noIndex />
      <div className="min-h-screen bg-luxury-dark text-white pb-24 max-w-screen-lg mx-auto">
        <Navbar />
        <header className="sticky top-[var(--navbar-height)] z-50 glass-nav border-b border-white/5 transition-all duration-300">
          <div className="flex items-center justify-between px-4 h-14">
            <BackButton variant="ghost" />
            <h1 className="text-base font-serif font-bold tracking-widest uppercase absolute left-1/2 -translate-x-1/2 pointer-events-none">Sua Seleção</h1>
            <div className="w-10" />
          </div>
        </header>
        <main className="p-4 space-y-6">
          {favProperties.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-semibold">Sua seleção está vazia</p>
              <p className="text-sm mt-2">Toque no ♥ para guardar os imóveis que mais despertam seu interesse</p>
            </div>
          ) : (
            favProperties.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)
          )}
          <Footer />
        </main>
      </div>
    </>
  );
}
