import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, ChevronLeft, ChevronRight, Search, MapPin, LayoutGrid, Home, Building2, Layers, LandPlot, Store, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-mansion.jpg";
import { useProperties, formatPriceFull } from "@/contexts/PropertyContext";
import { Ruler, BedDouble, Car } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import PropertyCard from "@/components/PropertyCard";
import SEOHead from "@/components/SEOHead";
import { searchLocations } from "@/data/pernambuco-locations";

const typeFilters = ["Todos", "Casa", "Apartamento", "Cobertura", "Terreno", "Comercial"];
const sortOptions = [
  { value: "area_desc", label: "Maior área" },
];

export default function Index() {
  const navigate = useNavigate();
  const { properties, settings, favorites, toggleFavorite, loading } = useProperties();
  const available = properties.filter((p) => !p.status || p.status === "disponivel");
  const featured = available.filter((p) => p.featured);
  const [activeType, setActiveType] = useState("Todos");
  const [sortBy, setSortBy] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredProperties = useMemo(() => {
    let result = activeType === "Todos" ? available : available.filter((p) => p.type === activeType);
    if (sortBy === "area_desc") return [...result].sort((a, b) => b.area - a.area);
    return result;
  }, [available, activeType, sortBy]);

  const displayedProperties = showAll ? filteredProperties : filteredProperties.slice(0, 6);

  // Hero carousel - show ALL properties
  const heroSlides = properties.length > 0
    ? properties.map((p) => ({ image: p.images[0] || heroImage, title: p.title, id: p.id }))
    : [{ image: heroImage, title: settings.heroTitle, id: null as string | null }];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickSearch, setQuickSearch] = useState("");
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(false);
  const quickSuggestions = searchLocations(quickSearch);
  const quickSearchRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickSearchRef.current && !quickSearchRef.current.contains(e.target as Node)) {
        setShowQuickSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  // Auto-advance carousel
  const intervalMs = (settings.bannerInterval || 5) * 1000;
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [heroSlides.length, intervalMs]);

  useEffect(() => {
    setCurrentSlide((prev) => (prev >= heroSlides.length ? 0 : prev));
  }, [heroSlides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  // Dynamic collections from property types
  const collections = Array.from(
    properties.reduce((map, p) => {
      if (!map.has(p.type)) {
        map.set(p.type, { type: p.type, image: p.images[0] || heroImage, count: 1 });
      } else {
        map.get(p.type)!.count += 1;
      }
      return map;
    }, new Map<string, { type: string; image: string; count: number }>())
  ).map(([, v]) => v);

  return (
    <PageTransition>
      <SEOHead title={settings.heroTitle} description={`${settings.brandName} — Imóveis de luxo em Recife e região. Encontre casas, apartamentos e coberturas exclusivas.`} />
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex min-h-screen w-full flex-col bg-luxury-dark overflow-x-hidden pb-24"
          >
            {/* Skeleton Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-card/10 max-w-screen-lg mx-auto bg-luxury-dark">
              <div className="w-8 h-8 rounded bg-card/10 animate-pulse" />
              <div className="h-12 w-40 rounded bg-card/10 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-card/10 animate-pulse" />
            </nav>

            {/* Skeleton Hero */}
            <section className="relative h-[85vh] w-full shrink-0 overflow-hidden bg-card/5 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-8 gap-4">
                <div className="h-10 w-64 rounded bg-card/10 animate-pulse" />
                <div className="h-8 w-48 rounded bg-card/10 animate-pulse" />
                <div className="h-12 w-40 rounded-full border-2 border-card/10 animate-pulse mt-2" />
                <div className="flex gap-2 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`h-1 rounded-full bg-card/10 animate-pulse ${i === 0 ? "w-8" : "w-2"}`} />
                  ))}
                </div>
              </div>
            </section>

            {/* Skeleton Featured */}
            <section className="relative -mt-12 z-10 bg-luxury-dark rounded-t-xl pb-8">
              <div className="px-6 pt-8 pb-4 flex justify-between items-end">
                <div>
                  <div className="h-3 w-20 rounded bg-card/10 animate-pulse mb-2" />
                  <div className="h-7 w-32 rounded bg-card/10 animate-pulse" />
                </div>
                <div className="h-4 w-20 rounded bg-card/10 animate-pulse" />
              </div>
              <div className="flex overflow-x-auto hide-scrollbar gap-5 px-6 pb-6">
                {[0, 1].map((i) => (
                  <div key={i} className="flex flex-col min-w-[280px] bg-luxury-dark-lighter/40 rounded-xl overflow-hidden border border-card/5">
                    <div className="w-full aspect-[4/3] bg-card/10 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 w-28 rounded bg-card/10 animate-pulse" />
                      {settings.showLocationOnCard && <div className="h-4 w-40 rounded bg-card/10 animate-pulse" />}
                      <div className="flex gap-4">
                        <div className="h-3 w-14 rounded bg-card/10 animate-pulse" />
                        <div className="h-3 w-14 rounded bg-card/10 animate-pulse" />
                        <div className="h-3 w-14 rounded bg-card/10 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex min-h-screen w-full flex-col bg-luxury-dark overflow-x-hidden pb-24"
          >
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-nav border-b border-card/10 max-w-screen-lg mx-auto">
              <button onClick={() => navigate("/admin")} className="text-accent">
                <span className="text-2xl">☰</span>
              </button>
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.brandName} className="h-[110px] max-w-[380px] object-contain" />
              ) : (
                <h1 className="font-serif text-xl font-bold tracking-widest text-accent uppercase">{settings.brandName}</h1>
              )}
              <button onClick={() => navigate("/login")} className="text-card">
                <span className="text-2xl">👤</span>
              </button>
            </nav>

            {/* Hero Carousel */}
            <section className="relative h-[85vh] w-full shrink-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
                >
                  <div className="absolute inset-0 hero-gradient" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              {heroSlides.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-foreground/30 backdrop-blur-sm p-2 rounded-full">
                    <ChevronLeft className="h-5 w-5 text-card" />
                  </button>
                  <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-foreground/30 backdrop-blur-sm p-2 rounded-full">
                    <ChevronRight className="h-5 w-5 text-card" />
                  </button>
                </>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-8 text-center z-10">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentSlide}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="font-serif text-4xl text-card leading-tight mb-6"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h2>
                </AnimatePresence>

                {/* Quick Search */}
                <motion.div
                  ref={quickSearchRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative w-full max-w-md mb-6"
                >
                  <div className="relative flex items-center group">
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-accent/40 via-primary/20 to-accent/40 opacity-60 blur-sm group-focus-within:opacity-100 transition-opacity duration-500" />
                    <Search className="absolute left-5 h-5 w-5 text-accent/80 z-10" />
                    <input
                      className="relative w-full h-14 pl-13 pr-5 bg-foreground/20 backdrop-blur-2xl rounded-full text-sm font-medium text-card shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] border border-card/15 focus:border-accent/40 focus:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_hsl(var(--accent)/0.15)] focus:outline-none transition-all duration-300 placeholder:text-card/50"
                      style={{ paddingLeft: '3rem' }}
                      value={quickSearch}
                      onChange={(e) => { setQuickSearch(e.target.value); setShowQuickSuggestions(true); }}
                      onFocus={() => setShowQuickSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && quickSearch.trim()) {
                          navigate(`/busca?location=${encodeURIComponent(quickSearch.trim())}`);
                        }
                      }}
                      placeholder="Buscar por cidade ou bairro..."
                    />
                  </div>
                  {showQuickSuggestions && quickSearch.trim() && quickSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-3 max-h-56 overflow-y-auto rounded-2xl bg-foreground/25 backdrop-blur-2xl border border-card/15 shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-50">
                      {quickSuggestions.map((s, i) => (
                        <button
                          key={`${s.city}-${s.neighborhood || ""}-${i}`}
                          onClick={() => {
                            const loc = s.neighborhood ? `${s.neighborhood}, ${s.city}` : s.city;
                            navigate(`/busca?location=${encodeURIComponent(loc)}`);
                          }}
                          className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-card/10 transition-colors duration-200 border-b border-card/5 last:border-0"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-accent" />
                          <div className="min-w-0">
                            {s.neighborhood ? (
                              <>
                                <span className="text-sm font-semibold text-card">{s.neighborhood}</span>
                                <span className="text-xs text-card/50 ml-1.5">{s.city}, PE</span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-card">{s.city}, PE</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  onClick={() => {
                    const slide = heroSlides[currentSlide];
                    if (slide.id) {
                      navigate(`/imovel/${slide.id}`);
                    } else {
                      navigate("/busca");
                    }
                  }}
                  className="flex min-w-[160px] items-center justify-center overflow-hidden rounded-full h-12 px-8 border-2 border-accent text-accent bg-transparent text-sm font-bold uppercase tracking-[0.2em] transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  Conheça
                </motion.button>

                {/* Dots */}
                <div className="mt-8 flex gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      className={`h-1 rounded-full transition-all ${i === currentSlide ? "w-8 bg-accent" : "w-2 bg-card/30"}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Inline Filters - Minimal top bar */}
            <div className="sticky top-0 z-40 bg-luxury-dark/95 backdrop-blur-xl border-b border-card/10 shadow-lg">
              <div className="flex overflow-x-auto hide-scrollbar gap-2.5 px-4 py-3">
                {typeFilters.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setActiveType(type); setShowAll(false); }}
                    className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      activeType === type
                        ? "bg-accent text-accent-foreground shadow-md"
                        : "bg-card/5 text-card/50 hover:text-card hover:bg-card/10"
                    }`}
                  >
                    {type}
                  </button>
                ))}
                <div className="shrink-0 w-px h-6 bg-card/10 self-center mx-1" />
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(sortBy === opt.value ? "" : opt.value)}
                    className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-semibold tracking-wider transition-all active:scale-95 ${
                      sortBy === opt.value
                        ? "text-primary bg-primary/10"
                        : "text-card/30 hover:text-card/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <section className="relative z-10 bg-luxury-dark pb-8">
              {/* Filtered Properties Grid - immediately visible after filters */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-serif text-card">
                    {activeType === "Todos" ? "Todos os Imóveis" : activeType}
                  </h3>
                  <span className="text-card/40 text-xs font-medium">
                    {filteredProperties.length} {filteredProperties.length === 1 ? "imóvel" : "imóveis"}
                  </span>
                </div>

                {displayedProperties.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {displayedProperties.map((p, i) => (
                        <PropertyCard key={p.id} property={p} index={i} />
                      ))}
                    </div>
                    {!showAll && filteredProperties.length > 6 && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={() => setShowAll(true)}
                          className="flex items-center gap-2 px-8 py-3 rounded-full border-2 border-accent text-accent text-sm font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                          Ver todos os {filteredProperties.length} imóveis <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-card/50 text-sm text-center py-12">Nenhum imóvel encontrado para "{activeType}".</p>
                )}
              </div>

              {/* Featured */}
              {featured.length > 0 && (
                <>
              <div className="px-6 pt-6 pb-4 flex justify-between items-end">
                <div>
                  <span className="text-accent text-xs font-bold uppercase tracking-widest">Exclusividade {settings.brandName}</span>
                  <h3 className="text-2xl font-serif text-card mt-1">Destaques</h3>
                </div>
                <button onClick={() => navigate("/busca")} className="text-primary text-sm font-semibold flex items-center gap-1">
                  Ver todos <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex overflow-x-auto hide-scrollbar gap-5 px-6 pb-6">
                {featured.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i }}
                    className="flex flex-col min-w-[280px] bg-luxury-dark-lighter/40 rounded-xl overflow-hidden border border-card/5 cursor-pointer"
                    onClick={() => navigate(`/imovel/${p.id}`)}
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      {p.status && p.status !== "disponivel" && (
                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-sm shadow-lg ${
                          p.status === "reservado" ? "bg-yellow-500/90" : "bg-red-500/90"
                        }`}>
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {p.status === "reservado" ? "Reservado" : "Vendido"}
                          </span>
                        </div>
                      )}
                      <button
                        className="absolute top-3 right-3 bg-foreground/50 backdrop-blur-md p-1.5 rounded-full"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(p.id) ? "fill-accent text-accent" : "text-card"}`} />
                      </button>
                    </div>
                    <div className="p-5">
                      <p className="text-accent text-lg font-bold">{formatPriceFull(p.price)}</p>
                      <p className="text-card/70 text-sm font-medium mb-3">
                        {p.title}
                        {settings.showLocationOnCard && ` - ${p.neighborhood}`}
                      </p>
                      <div className="flex items-center gap-4 text-card/50 text-xs uppercase tracking-tighter">
                        <div className="flex items-center gap-1"><Ruler className="h-3 w-3 text-primary" />{p.area}m²</div>
                        <div className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-primary" />{p.suites} Suítes</div>
                        <div className="flex items-center gap-1"><Car className="h-3 w-3 text-primary" />{p.parking} Vagas</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
                </>
              )}

              {/* CTA Banner with first property cover */}
              {properties.length > 0 && (
                <div className="px-6 py-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative h-56 md:h-64 rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => navigate(`/imovel/${properties[0].id}`)}
                  >
                    <img
                      src={properties[0].images[0]}
                      alt={properties[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
                    <div className="relative z-10 flex flex-col justify-center h-full px-8 max-w-sm">
                      <span className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Em destaque</span>
                      <h3 className="font-serif text-2xl md:text-3xl text-card leading-tight mb-2">{properties[0].title}</h3>
                      {settings.showLocationOnCard && (
                        <p className="text-card/70 text-sm mb-4">{properties[0].neighborhood} · {properties[0].city}</p>
                      )}
                      <span className="inline-flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
                        Saiba mais <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Dynamic Collections */}
              <div className="px-6 py-6">
                <h4 className="text-card font-serif text-lg mb-4">Coleções</h4>
                {collections.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {collections.map((col) => (
                      <button
                        key={col.type}
                        onClick={() => { setActiveType(col.type); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="relative h-28 rounded-lg overflow-hidden border border-card/5"
                      >
                        <img src={col.image} alt={col.type} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-foreground/50" />
                        <div className="relative z-10 flex flex-col justify-center items-center h-full">
                          <span className="text-card font-bold tracking-widest text-xs uppercase">{col.type}</span>
                          <span className="text-card/60 text-[10px] mt-1">{col.count} {col.count === 1 ? "imóvel" : "imóveis"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-card/50 text-sm">Cadastre imóveis para ver as coleções.</p>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
