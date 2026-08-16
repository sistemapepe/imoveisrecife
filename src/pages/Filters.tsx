import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, ChevronRight, ArrowRight, MapPin, ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";

import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { searchLocations } from "@/data/pernambuco-locations";

const types = ["Casa", "Apartamento", "Cobertura", "Terreno", "Comercial"];
const bedroomOptions = ["1", "2", "3", "4", "5+"];
const parkingOptions = ["1", "2", "3", "4+", "6+"];

export default function Filters() {
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState("");
  const [selectedParking, setSelectedParking] = useState("");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ city: string; neighborhood?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestions(searchLocations(search));
    }, 300); // Debounce de 300ms
    return () => clearTimeout(timer);
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
    <>
      <SEOHead title="Filtros" description="Filtre imóveis por tipo, quartos, localização e mais." noIndex />
      <div className="relative flex min-h-screen w-full flex-col max-w-screen-lg mx-auto bg-luxury-dark text-white">
        <Navbar />
        <header className="sticky top-[var(--navbar-height)] z-30 glass-nav border-b border-white/5 transition-all duration-300">
          <div className="flex items-center justify-between px-4 h-14">
            <BackButton variant="ghost" label="Fechar filtros" />
            <h1 className="text-base font-serif font-bold tracking-widest uppercase absolute left-1/2 -translate-x-1/2 pointer-events-none text-white">Refinar Busca</h1>
            <button 
              className="text-accent text-[10px] font-bold uppercase tracking-widest h-10 px-2 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors -mr-1" 
              onClick={() => { setSearch(""); setSelectedTypes([]); setSelectedBedrooms(""); setSelectedParking(""); }}
            >
              Limpar
            </button>
          </div>
          <div className="px-4 pb-4 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-accent/60" />
              <input
                ref={inputRef}
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent/40 focus:outline-none transition-all placeholder:text-white/30"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Cidade, Bairro ou Condomínio"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-4 right-4 top-full mt-2 max-h-64 overflow-y-auto rounded-2xl bg-[#0d1419] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 backdrop-blur-2xl"
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
          <Footer />
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
            <span className="text-accent-foreground font-extrabold tracking-wide uppercase">Ver Imóveis</span>
            <ArrowRight className="h-5 w-5 text-accent-foreground" />
          </button>
        </div>
      </div>
    </>
  );
}
