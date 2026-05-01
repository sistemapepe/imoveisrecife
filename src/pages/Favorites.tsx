import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import PropertyCard from "@/components/PropertyCard";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Favorites() {
  const navigate = useNavigate();
  const { properties, favorites } = useProperties();
  const favProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <PageTransition>
      <SEOHead title="Favoritos" description="Seus imóveis favoritos salvos para consulta rápida." noIndex />
      <div className="min-h-screen bg-background pb-24 max-w-screen-lg mx-auto">
        <Navbar />
        <header className="sticky top-[var(--navbar-height)] z-50 glass-header border-b border-border transition-all duration-300">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-10 h-10 flex items-center justify-center">
              <ArrowLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="text-lg font-bold">Sua Seleção</h1>
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
    </PageTransition>
  );
}
