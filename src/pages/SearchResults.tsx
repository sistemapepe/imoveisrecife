import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, X, MapPin } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import PropertyCard from "@/components/PropertyCard";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";

const propertyTypes = ["Casa", "Apartamento", "Cobertura", "Terreno", "Comercial"] as const;
const statusOptions = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
] as const;

export default function SearchResults() {
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
  }, [properties, activeFilters, locationFilter, bedroomsFilter, parkingFilter]);

  return (
    <PageTransition>
      <SEOHead title="Resultados da Busca" description="Encontre imóveis em Recife e região com filtros avançados." />
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 glass-header border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10">
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
            <div className="text-center">
              <h1 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Resultados</h1>
              <p className="text-sm font-semibold text-foreground italic">{filtered.length} Imóveis encontrados</p>
            </div>
            <button onClick={() => navigate("/filtros")} className="flex items-center justify-center w-10 h-10">
              <SlidersHorizontal className="h-6 w-6 text-foreground" />
            </button>
          </div>

          {/* Active location badge */}
          {locationFilter && (
            <div className="px-4 pb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <MapPin className="h-3 w-3" />
                {locationFilter}
                <button onClick={() => navigate("/busca")} className="ml-1 hover:text-primary/70"><X className="h-3 w-3" /></button>
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
                  {type}
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
          {filtered.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </main>
      </div>
    </PageTransition>
  );
}
