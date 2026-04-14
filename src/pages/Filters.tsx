import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, ChevronRight, ArrowRight, MapPin } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";
import { searchLocations } from "@/data/pernambuco-locations";

const types = ["Casa", "Apartamento", "Cobertura", "Terreno", "Comercial"];
const bedroomOptions = ["1", "2", "3", "4", "5+"];
const parkingOptions = ["1", "2", "3", "4+", "6+"];

export default function Filters() {
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Casa"]);
  const [selectedBedrooms, setSelectedBedrooms] = useState("3");
  const [selectedParking, setSelectedParking] = useState("4+");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ city: string; neighborhood?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(searchLocations(search));
  }, [search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectLocation = (city: string, neighborhood?: string) => {
    setSearch(neighborhood ? `${neighborhood}, ${city}` : city);
    setShowSuggestions(false);
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  return (
    <PageTransition>
      <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto bg-background">
        <header className="sticky top-0 z-30 glass-header border-b border-border">
          <div className="flex items-center justify-between px-4 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary transition-colors">
              <X className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Filtros Avançados</h1>
            <button className="text-primary text-sm font-semibold" onClick={() => { setSearch(""); setSelectedTypes([]); setSelectedBedrooms(""); setSelectedParking(""); }}>Limpar</button>
          </div>
          <div className="px-4 pb-4 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                className="w-full h-12 pl-10 pr-4 bg-secondary border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Cidade, Bairro ou Condomínio"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-4 right-4 top-full mt-1 max-h-64 overflow-y-auto rounded-xl bg-card border border-border shadow-xl z-50"
              >
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.city}-${s.neighborhood || ""}-${i}`}
                    onClick={() => selectLocation(s.city, s.neighborhood)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary/60 transition-colors border-b border-border/50 last:border-0"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-accent" />
                    <div className="min-w-0">
                      {s.neighborhood ? (
                        <>
                          <span className="text-sm font-semibold text-foreground">{s.neighborhood}</span>
                          <span className="text-xs text-muted-foreground ml-1.5">{s.city}, PE</span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-foreground">{s.city}, PE</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto hide-scrollbar pb-32">
          <section className="mt-4 px-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Tipo de Imóvel</h3>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button key={t} onClick={() => toggleType(t)} className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${selectedTypes.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary"}`}>{t}</button>
              ))}
            </div>
          </section>
          <div className="h-px bg-border mx-4 my-6" />
          <section className="px-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Faixa de Preço</h3>
              <div className="text-accent font-bold text-sm">R$ 2.5M - R$ 15M+</div>
            </div>
            <div className="relative h-10 flex items-center">
              <div className="absolute w-full h-1.5 bg-secondary rounded-full" />
              <div className="absolute left-[20%] right-[10%] h-1.5 gold-gradient rounded-full" />
              <div className="absolute left-[20%] -ml-3 h-6 w-6 rounded-full bg-card border-2 border-accent shadow-lg" />
              <div className="absolute right-[10%] -mr-3 h-6 w-6 rounded-full bg-card border-2 border-accent shadow-lg" />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase"><span>R$500K</span><span>R$50M+</span></div>
          </section>
          <div className="h-px bg-border mx-4 my-6" />
          <section className="px-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Quartos</h3>
            <div className="grid grid-cols-5 gap-2">
              {bedroomOptions.map((b) => (
                <button key={b} onClick={() => setSelectedBedrooms(b)} className={`aspect-square flex items-center justify-center rounded-lg border text-sm font-bold ${selectedBedrooms === b ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}>{b}</button>
              ))}
            </div>
          </section>
          <div className="h-px bg-border mx-4 my-6" />
          <section className="px-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Vagas de Garagem</h3>
            <div className="grid grid-cols-5 gap-2">
              {parkingOptions.map((p) => (
                <button key={p} onClick={() => setSelectedParking(p)} className={`aspect-square flex items-center justify-center rounded-lg border text-sm font-bold ${selectedParking === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}>{p}</button>
              ))}
            </div>
          </section>
          <section className="mt-8 px-4 space-y-4">
            {["Lazer e Amenidades", "Segurança", "Área Útil (m²)"].map((label) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-border cursor-pointer">
                <span className="font-semibold text-foreground">{label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </section>
        </main>

        <div className="fixed bottom-20 left-0 right-0 p-4 bg-card/90 backdrop-blur-lg border-t border-border z-50 max-w-md mx-auto">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (search) params.set("location", search);
              if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
              if (selectedBedrooms) params.set("bedrooms", selectedBedrooms);
              if (selectedParking) params.set("parking", selectedParking);
              navigate(`/busca?${params.toString()}`);
            }}
            className="w-full h-14 gold-gradient rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="text-accent-foreground font-extrabold tracking-wide uppercase">Ver Resultados</span>
            <ArrowRight className="h-5 w-5 text-accent-foreground" />
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
