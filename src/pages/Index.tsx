import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, ChevronLeft, ChevronRight, Search, MapPin, LayoutGrid, Home, Building2, Layers, LandPlot, Store, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-mansion.jpg";
import { useProperties, formatPriceFull } from "@/contexts/PropertyContext";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Ruler, BedDouble, Car } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import { searchLocations } from "@/data/pernambuco-locations";
import { getOptimizedImageUrl, getImageSrcSet, IMAGE_SIZES } from "@/lib/image-optimization";

const typeFilters = [
  { label: "Todos", short: "Todos", icon: LayoutGrid },
  { label: "Casa", short: "Casa", icon: Home },
  { label: "Apartamento", short: "Apt", icon: Building2 },
  { label: "Cobertura", short: "Cobertura", icon: Layers },
  { label: "Terreno", short: "Terreno", icon: LandPlot },
  { label: "Comercial", short: "Comercial", icon: Store },
];
const sortOptions = [
  { value: "area_desc", label: "Maior área", icon: ArrowUpDown },
];

export default function Index() {
  const navigate = useNavigate();
  const { properties, settings, favorites, toggleFavorite, loading } = useProperties();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const available = useMemo(() => properties.filter((p) => !p.status || p.status === "disponivel"), [properties]);
  const featured = useMemo(() => available.filter((p) => p.featured), [available]);
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
  const heroSlides = useMemo(() => properties.length > 0
    ? properties.map((p) => ({ image: p.images[0] || heroImage, title: p.title, id: p.id }))
    : [{ image: heroImage, title: settings.heroTitle, id: null as string | null }], [properties, settings.heroTitle]);

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

  // Preload first hero image to optimize LCP
  const firstHeroImage = heroSlides[0]?.image;
  useEffect(() => {
    if (!firstHeroImage) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = firstHeroImage;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [firstHeroImage]);

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

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://imoveisrecife.com.br";
  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: settings.brandName,
      url: siteOrigin,
      logo: settings.logoUrl || undefined,
      image: settings.logoUrl || undefined,
      description: `${settings.brandName} — Imóveis de alto padrão em Recife e região.`,
      areaServed: { "@type": "City", name: "Recife", addressRegion: "PE", addressCountry: "BR" },
      sameAs: [
        settings.instagramUrl,
        settings.facebookUrl,
        settings.youtubeUrl,
        settings.linkedinUrl,
        settings.websiteUrl,
      ].filter(Boolean),
      contactPoint: settings.whatsappNumber
        ? {
            "@type": "ContactPoint",
            telephone: `+${settings.whatsappNumber}`,
            contactType: "sales",
            areaServed: "BR",
            availableLanguage: ["Portuguese"],
          }
        : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: settings.brandName,
      url: siteOrigin,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteOrigin}/busca?location={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    available.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: available.slice(0, 12).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${siteOrigin}/imovel/${p.id}`,
            name: p.title,
          })),
        }
      : null,
  ].filter(Boolean) as Record<string, any>[];

  return (
    <div className="contents">
      <SEOHead
        title={settings.heroTitle}
        description={`${settings.brandName} — Imóveis de alto padrão em Recife e região. Encontre casas, apartamentos, coberturas e terrenos exclusivos com atendimento personalizado.`}
        jsonLd={homeJsonLd}
      />
      <div className="contents">
        <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex min-h-screen w-full flex-col bg-luxury-dark overflow-x-hidden pb-24 max-w-screen-lg mx-auto"
          >
            {/* Skeleton Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2 border-b border-card/10 max-w-screen-lg mx-auto bg-luxury-dark h-16">
              <div className="w-10 h-10 rounded-full bg-card/10 " />
              <div className="h-10 w-40 rounded bg-card/10 " />
              <div className="w-10" />
            </nav>

            {/* Skeleton Hero - Fixed Aspect Ratio to prevent layout shift */}
            <section className="relative h-[calc(100svh-220px)] md:h-[85vh] w-full shrink-0 overflow-hidden bg-card/5 ">
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-8 gap-4">
                <div className="h-10 w-64 rounded bg-card/10 " />
                <div className="h-8 w-48 rounded bg-card/10 " />
                <div className="h-12 w-40 rounded-full border-2 border-card/10  mt-2" />
                <div className="flex gap-2 mt-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`h-1 rounded-full bg-card/10  ${i === 0 ? "w-8" : "w-2"}`} />
                  ))}
                </div>
              </div>
            </section>

            {/* Skeleton Featured */}
            <section className="relative -mt-12 z-10 bg-luxury-dark rounded-t-xl pb-8">
              <div className="px-6 pt-8 pb-4 flex justify-between items-end">
                <div>
                  <div className="h-3 w-20 rounded bg-card/10  mb-2" />
                  <div className="h-7 w-32 rounded bg-card/10 " />
                </div>
                <div className="h-4 w-20 rounded bg-card/10 " />
              </div>
              <div className="flex overflow-x-auto hide-scrollbar gap-5 px-6 pb-6">
                {[0, 1].map((i) => (
                  <div key={i} className="flex flex-col min-w-[280px] bg-luxury-dark-lighter/40 rounded-xl overflow-hidden border border-card/5">
                    <div className="w-full aspect-[4/3] bg-card/10 " />
                    <div className="p-5 space-y-3">
                      <div className="h-5 w-28 rounded bg-card/10 " />
                      {settings.showLocationOnCard && <div className="h-4 w-40 rounded bg-card/10 " />}
                      <div className="flex gap-4">
                        <div className="h-3 w-14 rounded bg-card/10 " />
                        <div className="h-3 w-14 rounded bg-card/10 " />
                        <div className="h-3 w-14 rounded bg-card/10 " />
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
            className="relative flex min-h-screen w-full flex-col bg-luxury-dark overflow-x-hidden pb-24 max-w-screen-lg mx-auto"
          >
            <Navbar />
            <MarqueeBanner />

            {/* Hero Carousel */}
            <section className="relative h-[calc(100svh-220px)] md:h-[85vh] w-full shrink-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <img
                    src={getOptimizedImageUrl(heroSlides[currentSlide].image, IMAGE_SIZES.HERO)}
                    srcSet={getImageSrcSet(heroSlides[currentSlide].image, [800, 1200, 1920])}
                    sizes="100vw"
                    alt={heroSlides[currentSlide].title || "Imóvel em destaque"}
                    className="absolute inset-0 w-full h-full object-cover"
                    fetchPriority={currentSlide === 0 ? "high" : "auto"}
                    loading={currentSlide === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div className="absolute inset-0 hero-gradient" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              {heroSlides.length > 1 && (
                <>
                  <button onClick={prevSlide} aria-label="Slide anterior" className="absolute left-3 top-1/3 sm:top-1/2 -translate-y-1/2 z-20 bg-foreground/30 backdrop-blur-sm p-2 rounded-full">
                    <ChevronLeft className="h-5 w-5 text-card" />
                  </button>
                  <button onClick={nextSlide} aria-label="Próximo slide" className="absolute right-3 top-1/3 sm:top-1/2 -translate-y-1/2 z-20 bg-foreground/30 backdrop-blur-sm p-2 rounded-full">
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
                    className="font-serif text-5xl md:text-6xl text-card leading-[1.1] mb-8 drop-shadow-2xl"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h2>
                </AnimatePresence>

                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 hsl(var(--accent) / 0.5)",
                      "0 0 0 12px hsl(var(--accent) / 0)",
                      "0 0 0 0 hsl(var(--accent) / 0)",
                    ],
                  }}
                  transition={{
                    opacity: { duration: 0.5, delay: 0.2 },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeOut" },
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92, transition: { type: "spring", stiffness: 600, damping: 18 } }}
                  onClick={() => {
                    const slide = heroSlides[currentSlide];
                    if (slide.id) {
                      navigate(`/imovel/${slide.id}`);
                    } else {
                      navigate("/busca");
                    }
                  }}
                  className="group relative flex min-w-[220px] items-center justify-center overflow-hidden rounded-2xl h-14 px-10 mb-8 border border-white/20 text-white text-xs font-extrabold uppercase tracking-[0.25em] transition-all hover:border-accent/60 active:scale-[0.98] premium-shadow"
                >
                  <span
                    className="pointer-events-none absolute inset-0 opacity-90 transition-opacity group-hover:opacity-100"
                    style={{
                      backgroundImage:
                        "var(--gold-gradient)",
                    }}
                  />
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite]" />
                  <span className="relative z-10 drop-shadow-sm flex items-center gap-2">
                    Descobrir <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.button>


                {/* Quick Search */}
                <motion.div
                  ref={quickSearchRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative w-full max-w-md mx-auto"
                >
                  <div className="relative flex items-center group">
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-accent/40 via-primary/20 to-accent/40 opacity-60 blur-sm group-focus-within:opacity-100 transition-opacity duration-500" />
                    <Search className="absolute left-5 h-5 w-5 text-accent/80 z-10" />
                    <input
                      className="relative w-full h-14 pl-13 pr-5 bg-foreground/20 backdrop-blur-3xl rounded-[1.25rem] text-sm font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10 focus:border-accent/60 focus:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_25px_rgba(212,175,55,0.15)] focus:outline-none transition-all duration-300 placeholder:text-white/40"
                      style={{ paddingLeft: '3.25rem' }}
                      value={quickSearch}
                      onChange={(e) => { 
                        setQuickSearch(e.target.value); 
                        if (e.target.value.trim().length >= 2) {
                          setShowQuickSuggestions(true);
                        }
                      }}
                      onFocus={() => {
                        if (quickSearch.trim().length >= 2) {
                          setShowQuickSuggestions(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && quickSearch.trim()) {
                          navigate(`/busca?location=${encodeURIComponent(quickSearch.trim())}`);
                        }
                      }}
                      placeholder="Onde deseja morar?"
                    />
                  </div>
                  {showQuickSuggestions && quickSearch.trim() && quickSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-3 max-h-56 overflow-y-auto rounded-2xl bg-[#0d1419]/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50">
                      {quickSuggestions.map((s, i) => (
                        <button
                          key={`${s.city}-${s.neighborhood || ""}-${i}`}
                          onClick={() => {
                            const loc = s.neighborhood ? `${s.neighborhood}, ${s.city}` : s.city;
                            navigate(`/busca?location=${encodeURIComponent(loc)}`);
                          }}
                          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-white/5 transition-colors duration-200 border-b border-white/5 last:border-0"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-accent" />
                          <div className="min-w-0">
                            {s.neighborhood ? (
                              <>
                                <span className="text-sm font-semibold text-white">{s.neighborhood}</span>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">{s.city}, PE</span>
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
            <div className="sticky top-[var(--navbar-height)] z-40 glass-nav border-b border-white/5 transition-all duration-300">
              <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-3">
                {typeFilters.map(({ label, short, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => { setActiveType(label); setShowAll(false); }}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all active:scale-95 ${
                      activeType === label
                        ? "gold-gradient text-white shadow-lg shadow-accent/20"
                        : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {short}
                  </button>
                ))}
                <div className="shrink-0 w-px h-5 bg-card/10 self-center mx-0.5" />
                {sortOptions.map((opt) => {
                  const SortIcon = opt.icon;
                  return (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(sortBy === opt.value ? "" : opt.value)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold tracking-wider transition-all active:scale-95 ${
                      sortBy === opt.value
                        ? "text-primary bg-primary/10"
                        : "text-card/30 hover:text-card/60"
                    }`}
                  >
                    <SortIcon className="h-3 w-3" />
                    {opt.label}
                  </button>
                  );
                })}
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
                          className="flex items-center gap-2 px-10 py-4 rounded-full gold-gradient text-white text-sm font-bold uppercase tracking-[0.15em] hover:scale-105 transition-all shadow-xl shadow-accent/20"
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
                <button onClick={() => navigate("/busca")} className="text-accent text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                    className="flex flex-col min-w-[300px] bg-white/[0.03] rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer premium-shadow-hover transition-all duration-500"
                    onClick={() => navigate(`/imovel/${p.id}`)}
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <img 
                        src={getOptimizedImageUrl(p.images[0], IMAGE_SIZES.CARD)} 
                        srcSet={getImageSrcSet(p.images[0], [400, 600])}
                        sizes="(max-width: 640px) 100vw, 300px"
                        alt={p.title} 
                        className="w-full h-full object-cover" 
                        loading="lazy" 
                        decoding="async" 
                      />
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
                        aria-label={favorites.includes(p.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        aria-pressed={favorites.includes(p.id)}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(p.id) ? "fill-accent text-accent" : "text-card"}`} />
                      </button>
                    </div>
                    <div className="p-6">
                      <h4 className="font-serif text-lg text-white mb-2 line-clamp-1">{p.title}</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <PriceDisplay as="p" section="banner" value={p.price} className="text-accent font-bold text-lg" />
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                          {p.neighborhood}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/50 text-[10px] uppercase tracking-widest font-bold border-t border-white/5 pt-4">
                        {!!p.area && <div className="flex items-center gap-1.5"><Ruler className="h-3 w-3 text-accent" />{p.area}m²</div>}
                        {!!p.suites && <div className="flex items-center gap-1.5"><BedDouble className="h-3 w-3 text-accent" />{p.suites} Suítes</div>}
                        {!!p.parking && <div className="flex items-center gap-1.5"><Car className="h-3 w-3 text-accent" />{p.parking} Vagas</div>}
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
                    className="relative h-56 md:h-64 rounded-[2rem] overflow-hidden cursor-pointer group premium-shadow"
                    onClick={() => navigate(`/imovel/${properties[0].id}`)}
                  >
                    <img
                      src={getOptimizedImageUrl(properties[0].images[0], IMAGE_SIZES.HERO)}
                      srcSet={getImageSrcSet(properties[0].images[0], [600, 1200])}
                      sizes="(max-width: 1024px) 100vw, 800px"
                      alt={properties[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
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
              <div className="px-6 py-10">
                <h4 className="text-white font-serif text-2xl mb-6">Coleções</h4>
                {collections.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {collections.map((col) => (
                      <button
                        key={col.type}
                        onClick={() => { setActiveType(col.type); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="relative h-32 rounded-[1.5rem] overflow-hidden border border-white/5 premium-shadow-hover transition-all duration-300"
                      >
                        <img src={col.image} alt={col.type} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                        <div className="relative z-10 flex flex-col justify-center items-center h-full">
                          <span className="text-white font-bold tracking-[0.2em] text-[10px] uppercase">{col.type}</span>
                          <span className="text-white/60 text-[9px] mt-1 font-bold uppercase tracking-widest">{col.count} {col.count === 1 ? "imóvel" : "imóveis"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-card/50 text-sm">Cadastre imóveis para ver as coleções.</p>
                )}
              </div>

              <Footer />
            </section>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
