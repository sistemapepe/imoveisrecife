import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getActiveSiteId } from "@/contexts/TenantContext";
import { toast } from "sonner";
import { useProperties } from "@/contexts/PropertyContext";
import { checkHoneypot, HONEYPOT_FIELD_NAME, honeypotInputStyle } from "@/lib/honeypot";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyTitle?: string;
  propertyId?: string;
  source?: string;
}

// Brazilian phone mask: (99) 99999-9999 or (99) 9999-9999
function formatBrPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo")
    .max(100, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length === 10 || digits.length === 11;
    }, "Informe DDD + número (ex: (81) 99999-9999)"),
});

export default function LeadCaptureModal({
  open,
  onClose,
  onConfirm,
  propertyTitle,
  propertyId,
  source = "whatsapp_fab",
}: LeadCaptureModalProps) {
  const { settings } = useProperties();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const openedAtRef = useRef<number>(Date.now());

  // If admin disabled the modal, skip it entirely
  useEffect(() => {
    if (open && settings.leadModalEnabled === false) {
      onConfirm();
    }
    if (open) {
      openedAtRef.current = Date.now();
    }
  }, [open, settings.leadModalEnabled, onConfirm]);

  // Lock body scroll while modal is open so it stays centered on viewport
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatBrPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Anti-bot: honeypot + time-trap
    const bot = checkHoneypot(honeypot, openedAtRef.current);
    if (!bot.ok) {
      // Silently pretend success to not tip off bots
      onConfirm();
      setName("");
      setPhone("");
      setHoneypot("");
      return;
    }
    const parsed = leadSchema.safeParse({ name, phone });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const interestText = propertyTitle
      ? `WhatsApp - ${propertyTitle}`
      : "WhatsApp";
    const messageText = [
      "Lead capturado antes do redirecionamento ao WhatsApp.",
      `Origem: ${source}`,
      propertyId ? `Imóvel ID: ${propertyId}` : null,
      propertyTitle ? `Imóvel: ${propertyTitle}` : null,
      typeof window !== "undefined" ? `URL: ${window.location.href}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    // Email placeholder: política RLS exige length(email) > 0.
    // Usamos um marcador para identificar leads vindos do modal WhatsApp.
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: "lead-whatsapp@nao-informado.local",
      phone: parsed.data.phone,
      interest: interestText.slice(0, 100),
      message: messageText.slice(0, 5000),
      source: source.slice(0, 50),
      site_id: getActiveSiteId(),
    });
    setSubmitting(false);
    if (error) {
      const msg = error.message?.includes("rate_limit_exceeded")
        ? "Muitas tentativas. Aguarde alguns minutos."
        : "Erro ao registrar. Continuando...";
      toast.error(msg);
    }
    onConfirm();
    setName("");
    setPhone("");
  };

  const handleSkip = () => {
    onConfirm();
  };

  if (settings.leadModalEnabled === false) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="fixed inset-0 flex items-center justify-center overflow-y-auto px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-modal-title"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md my-auto bg-card rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-whatsapp/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-whatsapp" />
                  </div>
                  <h2 id="lead-modal-title" className="font-bold text-base outline-none" tabIndex={-1}>{settings.leadModalTitle}</h2>
                </div>
                <button onClick={onClose} aria-label="Fechar" className="p-1 rounded-full hover:bg-muted transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Honeypot - invisible to humans, bots fill it */}
                <input
                  type="text"
                  name={HONEYPOT_FIELD_NAME}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={honeypotInputStyle}
                />
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {settings.leadModalDescription}
                </p>

                <div>
                  <label htmlFor="lead-name" className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                    {settings.leadModalNameLabel} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    autoComplete="name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent md:text-sm"
                    placeholder={settings.leadModalNamePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="lead-phone" className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                    {settings.leadModalPhoneLabel} <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="lead-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={16}
                    required
                    autoComplete="tel-national"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent md:text-sm"
                    placeholder="(81) 99999-9999"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-whatsapp text-white py-3.5 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <MessageCircle className="h-5 w-5" />
                  {submitting ? settings.leadModalSubmittingText : settings.leadModalSubmitText}
                </button>

                {settings.leadModalShowSkip !== false && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    {settings.leadModalSkipText}
                  </button>
                )}
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
