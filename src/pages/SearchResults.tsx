import { useState, useMemo, memo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, X, MapPin } from "lucide-react";
import BackButton from "@/components/BackButton";
import { useProperties } from "@/contexts/PropertyContext";
import PropertyCard from "@/components/PropertyCard";

import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const propertyTypes = ["Casa", "Apartamento", "Cobertura", "Terreno", "Comercial"] as const;
const statusOptions = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
] as const;

export default function SearchResults() {
  useEffect(() => {
    console.log("[Performance] Rendered: SearchResults", { timestamp: Date.now() });
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      console.log(`[Performance] Unmounted: SearchResults (view time: ${duration.toFixed(2)}ms)`);
    };
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { properties } = useProperties();

  const locationFilter = searchParams.get("location") || "";
  const typesFilter = searchParams.get("types")?.split(",").filter(Boolean) || [];
  const bedroomsFilter = searchParams.get("bedrooms") || "";
  const parkingFilter = searchParams.get("parking") || "";

  const [activeFilters, setActiveFilters] = useState<string[]>(typesFilter);
  const [activeStatus, setActiveStatus] = useState<string[]>([]);

  const toggleFilter = (f: string) => {
    setActiveFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const toggleStatus = (s: string) => {
    setActiveStatus((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const filtered = useMemo(() => {
    let result = properties;

    // Filter by status
    if (activeStatus.length > 0) {
      result = result.filter((p) => activeStatus.includes(p.status || "disponivel"));
    }

    // Filter by type
    if (activeFilters.length > 0) {
      result = result.filter((p) => activeFilters.includes(p.type));
    }

    // Filter by location (city or neighborhood)
    if (locationFilter) {
      const loc = locationFilter.toLowerCase();
      result = result.filter((p) =>
        p.city.toLowerCase().includes(loc) ||
        p.neighborhood.toLowerCase().includes(loc) ||
        p.address.toLowerCase().includes(loc)
      );
    }

    // Filter by bedrooms
    if (bedroomsFilter) {
      const num = parseInt(bedroomsFilter);
      if (!isNaN(num)) {
        if (bedroomsFilter.includes("+")) {
          result = result.filter((p) => p.bedrooms >= num);
        } else {
          result = result.filter((p) => p.bedrooms >= num);
        }
      }
    }

    // Filter by parking
    if (parkingFilter) {
      const num = parseInt(parkingFilter);
      if (!isNaN(num)) {
        result = result.filter((p) => p.parking >= num);
      }
    }

    return result;
  }, [properties, activeFilters, activeStatus, locationFilter, bedroomsFilter, parkingFilter]);

  return (
    <>
      <SEOHead title="Resultados da Busca" description="Encontre imóveis em Recife e região com filtros avançados." />
      <div className="min-h-screen bg-luxury-dark pb-24 max-w-screen-lg mx-auto">
        <Navbar />
        <header className="sticky top-[var(--navbar-height)] z-50 glass-nav border-b border-white/5 transition-all duration-300">
          <div className="flex items-center justify-between px-4 h-14">
            <BackButton variant="ghost" />
            <div className="text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
               <h1 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-accent/60 leading-none mb-1">Resultados</h1>
              <p className="text-sm font-serif font-bold text-white italic">{filtered.length} Imóveis</p>
            </div>
            <button onClick={() => navigate("/filtros")} aria-label="Abrir filtros" className="flex items-center justify-center w-10 h-10 hover:bg-white/5 rounded-full transition-colors -mr-1">
              <SlidersHorizontal className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          {/* Active location badge */}
          {locationFilter && (
            <div className="px-4 pb-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {locationFilter}
                <button onClick={() => navigate("/busca")} aria-label="Remover filtro de localização" className="ml-1 hover:text-primary/70"><X className="h-3 w-3" aria-hidden="true" /></button>
              </span>
            </div>
          )}

          <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-3 border-t border-border/50">
            {propertyTypes.map((type) => {
              const active = activeFilters.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={`flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    active ? "bg-luxury-dark text-card" : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {type === "Apartamento" ? "Apt" : type}
                  {active && <X className="h-3 w-3" />}
                </button>
              );
            })}
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-2 border-t border-border/50">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground self-center mr-1">Status:</span>
            {statusOptions.map(({ value, label }) => {
              const active = activeStatus.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => toggleStatus(value)}
                  className={`flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    active
                      ? value === "vendido" ? "bg-red-500 text-white" : value === "reservado" ? "bg-yellow-500 text-white" : "bg-green-600 text-white"
                      : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {label}
                  {active && <X className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </header>
        <main className="p-4 space-y-6">
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-2">Nenhum imóvel encontrado para esses filtros.</p>
              <button onClick={() => navigate("/filtros")} className="text-primary font-semibold text-sm">Ajustar filtros</button>
            </div>
          )}
          <PropertyGrid properties={filtered} />
          <Footer />
        </main>
      </div>
    </>
  );
}

const PropertyGrid = memo(({ properties }: { properties: any[] }) => {
  return (
    <>
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} index={i} />
      ))}
    </>
  );
});
