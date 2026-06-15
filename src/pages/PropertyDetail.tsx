import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, BedDouble, Car, Ruler, MapPin, Award, Calendar, MessageCircle, Bath, DoorOpen, ChevronLeft, ChevronRight, TrendingDown } from "lucide-react";
import { getAmenityIcon } from "@/lib/amenity-icons";
import { motion } from "framer-motion";
import { useProperties, formatPriceFull } from "@/contexts/PropertyContext";
import { PriceDisplay } from "@/components/PriceDisplay";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import InteractiveMap from "@/components/InteractiveMap";
import ImageLightbox from "@/components/ImageLightbox";
import VirtualTour from "@/components/VirtualTour";
import VisitScheduleForm from "@/components/VisitScheduleForm";
import SimilarProperties from "@/components/SimilarProperties";
import RecentViewsBadge from "@/components/RecentViewsBadge";
import FinancingSimulator from "@/components/FinancingSimulator";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getOptimizedImageUrl, getImageSrcSet, IMAGE_SIZES } from "@/lib/image-optimization";
import { useResolvedImages, getPublicUrl } from "@/lib/property-image-url";

export default function PropertyDetail() {
  const { id } = useParams();
  
  useEffect(() => {
    console.log("[Performance] Rendered: PropertyDetail", { timestamp: Date.now(), propertyId: id });
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      console.log(`[Performance] Unmounted: PropertyDetail (view time: ${duration.toFixed(2)}ms)`);
    };
  }, [id]);
  const navigate = useNavigate();
  const { properties, settings, favorites, toggleFavorite } = useProperties();
  const property = properties.find((p) => p.id === id);
  const resolvedImages = useResolvedImages(property?.images ?? []);
  const [currentImg, setCurrentImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Pre-load next and previous images for the main gallery
  useEffect(() => {
    if (!resolvedImages || resolvedImages.length <= 1) return;

    const preloadImage = (index: number) => {
      const url = resolvedImages[index];
      if (!url) return;
      const img = new Image();
      img.src = getOptimizedImageUrl(url, IMAGE_SIZES.HERO);

      const imgMobile = new Image();
      imgMobile.src = getOptimizedImageUrl(url, { width: 600 });
    };

    preloadImage((currentImg + 1) % resolvedImages.length);
    preloadImage((currentImg - 1 + resolvedImages.length) % resolvedImages.length);
  }, [currentImg, resolvedImages]);

  // Track property view
  useEffect(() => {
    if (!id) return;
    supabase.from("property_views").insert({ property_id: id, ip_hash: "" }).then();
  }, [id]);

  if (!property) return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32">
        {/* Skeleton top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 max-w-screen-lg mx-auto">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        {/* Skeleton image */}
        <div className="w-full aspect-[4/5] md:aspect-[16/9] lg:aspect-[21/9] bg-muted animate-pulse" />
        {/* Skeleton content */}
        <div className="relative -mt-6 rounded-t-3xl bg-background p-6 max-w-screen-lg mx-auto space-y-4">
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-muted md:hidden" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-5 w-1/2 rounded bg-muted animate-pulse" />
          <div className="h-10 w-48 rounded bg-muted animate-pulse" />
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="space-y-2 mt-6">
            <div className="h-5 w-28 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </PageTransition>
  );

  const isFav = favorites.includes(property.id);
  const totalImages = property.images.length;

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url });
        return;
      } catch (err: any) {
        // User cancelled or share failed - fall back to clipboard
        if (err?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível compartilhar o link");
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no imóvel ${property.code}: ${property.title} - ${formatPriceFull(property.price)}\n${window.location.href}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  const handleWhatsApp = () => {
    setLeadModalOpen(true);
  };

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://imoveisrecife.com.br";
  const propertyUrl = `${siteOrigin}/imovel/${property.id}`;
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: propertyUrl,
    identifier: property.code,
    datePosted: new Date().toISOString(),
    image: property.images.map(getPublicUrl),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "BRL",
      url: propertyUrl,
      availability:
        property.status === "vendido"
          ? "https://schema.org/SoldOut"
          : property.status === "reservado"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: "PE",
      addressCountry: "BR",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: "MTK",
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    numberOfBedrooms: property.bedrooms,
    amenityFeature: (property.amenities || []).map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteOrigin },
      { "@type": "ListItem", position: 2, name: "Busca", item: `${siteOrigin}/busca` },
      { "@type": "ListItem", position: 3, name: property.title, item: propertyUrl },
    ],
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${property.title} — ${formatPriceFull(property.price)}`}
        description={`${property.type} com ${property.bedrooms} quartos, ${property.area}m² em ${property.neighborhood}, ${property.city}. ${property.description.slice(0, 120)}`}
        image={getPublicUrl(property.images[0])}
        type="article"
        keywords={`${property.type} ${property.neighborhood}, ${property.type} ${property.city}, ${property.bedrooms} quartos ${property.neighborhood}, imóvel ${property.code}`}
        jsonLd={[schemaOrg, breadcrumbJsonLd]}
      />
      <motion.div
        className="min-h-screen bg-background pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Navbar />
        
        {/* Floating Back Button handled by App.tsx */}

        {/* Image Gallery with swipe */}
        <div
          className="relative w-full aspect-[4/5] md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden touch-pan-y"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            touchDelta.current = 0;
          }}
          onTouchMove={(e) => {
            touchDelta.current = e.touches[0].clientX - touchStartX.current;
          }}
          onTouchEnd={() => {
            if (totalImages <= 1) return;
            if (touchDelta.current > 50) {
              setCurrentImg((prev) => (prev - 1 + totalImages) % totalImages);
            } else if (touchDelta.current < -50) {
              setCurrentImg((prev) => (prev + 1) % totalImages);
            }
            touchDelta.current = 0;
          }}
        >
          <img
            className="h-full w-full object-cover transition-opacity duration-300 cursor-pointer select-none"
            src={getOptimizedImageUrl(resolvedImages[currentImg] ?? property.images[currentImg], IMAGE_SIZES.HERO)}
            srcSet={getImageSrcSet(resolvedImages[currentImg] ?? property.images[currentImg], [600, 1200, 1920])}
            sizes="100vw"
            alt={`${property.title} - Foto ${currentImg + 1}`}
            draggable={false}
            onClick={() => { setLightboxIndex(currentImg); setLightboxOpen(true); }}
            loading="eager"
            fetchPriority="high"
          />
          {totalImages > 1 && (
            <>
              <button
                onClick={() => setCurrentImg((prev) => (prev - 1 + totalImages) % totalImages)}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/30 backdrop-blur-md flex items-center justify-center text-card border border-card/20 active:scale-95 transition-transform hidden md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImg((prev) => (prev + 1) % totalImages)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/30 backdrop-blur-md flex items-center justify-center text-card border border-card/20 active:scale-95 transition-transform hidden md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-foreground/60 backdrop-blur-sm text-card text-xs font-semibold">
                {currentImg + 1} / {totalImages}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {totalImages > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide max-w-screen-lg mx-auto">
            {(resolvedImages.length ? resolvedImages : property.images).map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImg(i)}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentImg ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img 
                  src={getOptimizedImageUrl(img, IMAGE_SIZES.THUMBNAIL)} 
                  alt={`Miniatura ${i + 1}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative -mt-6 rounded-t-3xl bg-background p-6 max-w-screen-lg mx-auto"
        >
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-muted md:hidden" />

          {/* Desktop: two-column layout */}
          <div className="md:grid md:grid-cols-[1fr_360px] md:gap-10">
            <div>
              {property.exclusive && (
                <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-xs tracking-widest uppercase">
                  <Award className="h-4 w-4" /> Exclusividade {settings.brandName}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">{property.title}</h1>
                {(property as any).status && (property as any).status !== "disponivel" && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    (property as any).status === "reservado"
                      ? "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-700 border border-red-500/30"
                  }`}>
                    {(property as any).status === "reservado" ? "Reservado" : "Vendido"}
                  </span>
                )}
                {(property as any).status === "disponivel" && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-700 border border-green-500/30">
                    Disponível
                  </span>
                )}
              </div>
              {settings.showLocationOnCard && (
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {property.address}, {property.neighborhood}
                </p>
              )}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <p className="text-xs font-mono text-primary/70">Cód: {property.code}</p>
                <RecentViewsBadge propertyId={property.id} />
              </div>
              {(() => {
                const hasPriceDrop = !!property.previous_price && property.previous_price > property.price;
                const dropPercent = hasPriceDrop
                  ? Math.round(((property.previous_price! - property.price) / property.previous_price!) * 100)
                  : 0;
                return (
                  <div className="mb-8">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl -rotate-1 rounded-xl scale-110 shadow-md border border-white/30" />
                        <div className="relative text-3xl md:text-4xl font-black text-accent tracking-tighter py-2 px-3">
                          {formatPriceFull(property.price)}
                        </div>
                      </div>
                      {hasPriceDrop && (
                        <span className="text-lg md:text-xl text-muted-foreground line-through decoration-destructive/40 ml-2">
                          {formatPriceFull(property.previous_price!)}
                        </span>
                      )}
                    </div>
                    {hasPriceDrop && (
                      <motion.div
                        initial={{ scale: 0, rotate: -8 }}
                        animate={{ scale: 1, rotate: -3 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                        className="inline-flex items-center gap-2 mt-3 bg-destructive px-4 py-2 rounded-sm shadow-2xl border border-destructive-foreground/20"
                      >
                        <TrendingDown className="h-4 w-4 text-destructive-foreground" />
                        <span className="text-xs font-bold text-destructive-foreground uppercase tracking-[0.18em]">
                          Preço Reduzido — {dropPercent}% off
                        </span>
                      </motion.div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                {[
                  { icon: DoorOpen, label: `${(property as any).bedrooms || 0}`, sub: "Quartos", value: (property as any).bedrooms },
                  { icon: BedDouble, label: `${property.suites}`, sub: "Suítes", value: property.suites },
                  { icon: Bath, label: `${property.bathrooms}`, sub: "Banheiros", value: property.bathrooms },
                  { icon: Car, label: `${property.parking}`, sub: "Vagas", value: property.parking },
                  { icon: Ruler, label: `${property.area}`, sub: "m²", value: property.area },
                ].filter(item => !!item.value).map(({ icon: Icon, label, sub }) => (
                  <div key={sub} className="flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-card border border-border shadow-sm">
                    <Icon className="h-5 w-5 text-accent mb-1.5" />
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{sub}</span>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold mb-3">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{property.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold mb-3">Comodidades</h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {property.amenities.map((a) => {
                    const AmenityIcon = getAmenityIcon(a);
                    return (
                      <div key={a} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-xs font-medium">
                        {AmenityIcon && <AmenityIcon className="h-3.5 w-3.5 text-accent" />}
                        {a}
                      </div>
                    );
                  })}
                </div>
              </div>

              <FinancingSimulator price={property.price} />

              {property.video_tour_url && (
                <VirtualTour videoUrl={property.video_tour_url} title={property.title} />
              )}

              {settings.showVisitSchedule && (
                <VisitScheduleForm propertyId={property.id} propertyTitle={property.title} />
              )}

              {settings.showLocationOnCard && (
                <InteractiveMap
                  address={property.address}
                  neighborhood={property.neighborhood}
                  city={property.city}
                />
              )}
            </div>

            {/* Desktop sidebar CTA */}
            <div className="hidden md:block">
              <div className="sticky top-24 space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div>
                  <p className="text-2xl font-extrabold text-accent">{formatPriceFull(property.price)}</p>
                  {!!property.previous_price && property.previous_price > property.price && (
                    <p className="text-sm text-muted-foreground line-through">{formatPriceFull(property.previous_price)}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{property.title}</p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-whatsapp text-white py-3.5 font-bold text-sm active:scale-95 transition-transform"
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </button>
                <button
                  onClick={() => navigate("/contato")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl gold-gradient py-3.5 text-accent-foreground font-bold text-sm active:scale-95 transition-transform uppercase tracking-widest"
                >
                  <Calendar className="h-5 w-5" /> Agendar Visita
                </button>
              </div>
            </div>
          </div>

          <SimilarProperties current={property} />
          <Footer />
        </motion.div>

        {/* Mobile bottom CTA */}
        <div className="fixed bottom-20 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-card/80 backdrop-blur-xl border-t border-border z-50 max-w-screen-lg mx-auto md:hidden">
          <div className="flex gap-3">
            <button onClick={handleShare} aria-label="Compartilhar imóvel" className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-foreground shadow-lg active:scale-95 transition-transform border border-border gap-0.5">
              <Share2 className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">Enviar</span>
            </button>
            <button onClick={handleWhatsApp} aria-label="Falar pelo WhatsApp" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-whatsapp text-card shadow-lg active:scale-95 transition-transform">
              <MessageCircle className="h-6 w-6" />
            </button>
            <button onClick={() => navigate("/contato")} className="flex-1 flex items-center justify-center gap-2 rounded-xl gold-gradient py-4 text-accent-foreground font-bold text-base shadow-lg active:scale-95 transition-transform uppercase tracking-widest">
              <Calendar className="h-5 w-5" /> Agendar Visita
            </button>
          </div>
        </div>
      </motion.div>

      <LeadCaptureModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onConfirm={() => {
          setLeadModalOpen(false);
          openWhatsApp();
        }}
        propertyTitle={property.title}
        propertyId={property.code}
      />

      <ImageLightbox
        images={resolvedImages.length ? resolvedImages : property.images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={property.title}
      />
    </PageTransition>
  );
}
