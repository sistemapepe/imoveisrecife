import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { useLocation, useParams } from "react-router-dom";
import { trackEvent } from "@/hooks/useTrafficTracker";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import React from "react";

const WhatsAppFab = React.forwardRef<HTMLDivElement>((_, ref) => {
  const { settings, properties } = useProperties();
  const location = useLocation();
  const params = useParams();
  const [open, setOpen] = useState(false);

  const currentProperty = useMemo(() => {
    if (!location.pathname.startsWith("/imovel/")) return null;
    const id = params.id || location.pathname.split("/imovel/")[1]?.split("/")[0];
    return properties.find((p) => p.id === id) || null;
  }, [location.pathname, params.id, properties]);

  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/login") || location.pathname === "/network-admin") return null;

  const source = currentProperty ? "whatsapp_fab_property" : "whatsapp_fab_global";

  const openWhatsApp = () => {
    trackEvent("whatsapp_click");
    const baseMsg = settings.whatsappMessage || "Olá! Gostaria de mais informações sobre os imóveis.";
    const msg = currentProperty
      ? `${baseMsg}\n\nImóvel: ${currentProperty.title} (${currentProperty.code || currentProperty.id})`
      : baseMsg;
    const message = encodeURIComponent(msg);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div ref={ref} className="contents">
      <button
        onClick={() => setOpen(true)}
        aria-label="Fale conosco pelo WhatsApp"
        className="fixed bottom-[calc(90px+env(safe-area-inset-bottom))] right-6 z-50 h-16 w-16 rounded-[1.75rem] bg-whatsapp text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all md:bottom-10 md:right-10 touch-manipulation border-2 border-white/20"
      >
        <MessageCircle className="h-8 w-8" />
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gold-gradient border-2 border-[#0d1419] animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
      </button>

      <LeadCaptureModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          openWhatsApp();
        }}
        propertyId={currentProperty?.id}
        propertyTitle={currentProperty?.title}
        source={source}
      />
    </div>
  );
});

WhatsAppFab.displayName = "WhatsAppFab";
export default WhatsAppFab;
