import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import PropertyCard from "@/components/PropertyCard";
import PageTransition from "@/components/PageTransition";

const propertyTypes = ["Casa", "Apartamento", "Cobertura", "Terreno", "Comercial"] as const;

export default function SearchResults() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (f: string) => {
    setActiveFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const filtered = activeFilters.length > 0
    ? properties.filter((p) => activeFilters.includes(p.type))
    : properties;

  return (
    <PageTransition>
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
            <p className="text-center py-20 text-muted-foreground">Nenhum imóvel cadastrado. Adicione pelo painel admin.</p>
          )}
          {filtered.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </main>
      </div>
    </PageTransition>
  );
}
