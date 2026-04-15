import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, BedDouble, Car, Ruler, MapPin, Award, Calendar, MessageCircle, Bath, DoorOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { getAmenityIcon } from "@/lib/amenity-icons";
import { motion } from "framer-motion";
import { useProperties, formatPriceFull } from "@/contexts/PropertyContext";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";
import InteractiveMap from "@/components/InteractiveMap";
import ImageLightbox from "@/components/ImageLightbox";
import VirtualTour from "@/components/VirtualTour";
import VisitScheduleForm from "@/components/VisitScheduleForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, settings, favorites, toggleFavorite } = useProperties();
  const property = properties.find((p) => p.id === id);
  const [currentImg, setCurrentImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
    const text = `${property.title} - ${formatPriceFull(property.price)} | ${property.neighborhood}, ${property.city}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text, url });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Link copiado!");
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no imóvel ${property.code}: ${property.title} - ${formatPriceFull(property.price)}\n${window.location.href}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: window.location.href,
    datePosted: new Date().toISOString(),
    image: property.images,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "BRL",
      availability: property.status === "vendido"
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
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${property.title} — ${formatPriceFull(property.price)}`}
        description={`${property.type} com ${property.bedrooms} quartos, ${property.area}m² em ${property.neighborhood}, ${property.city}. ${property.description.slice(0, 120)}`}
        image={property.images[0]}
        type="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>
      <motion.div
        className="min-h-screen bg-background pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-foreground/40 to-transparent max-w-screen-lg mx-auto">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => toggleFavorite(property.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
              <Heart className={`h-5 w-5 ${isFav ? "fill-accent text-accent" : ""}`} />
            </button>
            <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-md text-card border border-card/30">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

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
            src={property.images[currentImg]}
            alt={`${property.title} - Foto ${currentImg + 1}`}
            draggable={false}
            onClick={() => { setLightboxIndex(currentImg); setLightboxOpen(true); }}
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
            {property.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImg(i)}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentImg ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
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
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">{property.title}</h1>
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
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {property.address}, {property.neighborhood}
              </p>
              <p className="text-xs font-mono text-primary/70 mb-4">Cód: {property.code}</p>
              <div className="text-2xl md:text-3xl font-extrabold text-accent tracking-tight mb-8">{formatPriceFull(property.price)}</div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                {[
                  { icon: DoorOpen, label: `${(property as any).bedrooms || 0}`, sub: "Quartos" },
                  { icon: BedDouble, label: `${property.suites}`, sub: "Suítes" },
                  { icon: Bath, label: `${property.bathrooms}`, sub: "Banheiros" },
                  { icon: Car, label: `${property.parking}`, sub: "Vagas" },
                  { icon: Ruler, label: `${property.area}`, sub: "m²" },
                ].map(({ icon: Icon, label, sub }) => (
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

              {property.video_tour_url && (
                <VirtualTour videoUrl={property.video_tour_url} title={property.title} />
              )}

              <VisitScheduleForm propertyId={property.id} propertyTitle={property.title} />

              <InteractiveMap
                address={property.address}
                neighborhood={property.neighborhood}
                city={property.city}
              />
            </div>

            {/* Desktop sidebar CTA */}
            <div className="hidden md:block">
              <div className="sticky top-24 space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                <p className="text-2xl font-extrabold text-accent">{formatPriceFull(property.price)}</p>
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
        </motion.div>

        {/* Mobile bottom CTA */}
        <div className="fixed bottom-20 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-card/80 backdrop-blur-xl border-t border-border z-50 max-w-screen-lg mx-auto md:hidden">
          <div className="flex gap-3">
            <button onClick={handleShare} className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-foreground shadow-lg active:scale-95 transition-transform border border-border gap-0.5">
              <Share2 className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground">Enviar</span>
            </button>
            <button onClick={handleWhatsApp} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-whatsapp text-card shadow-lg active:scale-95 transition-transform">
              <MessageCircle className="h-6 w-6" />
            </button>
            <button onClick={() => navigate("/contato")} className="flex-1 flex items-center justify-center gap-2 rounded-xl gold-gradient py-4 text-accent-foreground font-bold text-base shadow-lg active:scale-95 transition-transform uppercase tracking-widest">
              <Calendar className="h-5 w-5" /> Agendar Visita
            </button>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={property.images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={property.title}
      />
    </PageTransition>
  );
}
