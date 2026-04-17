import { useState } from "react";
import { z } from "zod";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyTitle?: string;
  propertyId?: string;
  source?: string;
}

const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .min(8, "Telefone inválido")
    .max(20, "Telefone inválido")
    .regex(/^[0-9()+\-\s]+$/, "Telefone inválido"),
});

export default function LeadCaptureModal({
  open,
  onClose,
  onConfirm,
  propertyTitle,
  propertyId,
  source = "whatsapp_fab",
}: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: "",
      phone: parsed.data.phone,
      interest: interestText.slice(0, 100),
      message: messageText.slice(0, 5000),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao registrar. Continuando...");
    }
    onConfirm();
    setName("");
    setPhone("");
  };

  const handleSkip = () => {
    onConfirm();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-whatsapp/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-whatsapp" />
                </div>
                <h2 id="lead-modal-title" className="font-bold text-base">Antes de continuar</h2>
              </div>
              <button onClick={onClose} aria-label="Fechar" className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Deixe seu contato para o corretor te chamar de volta caso o WhatsApp não responda.
              </p>

              <div>
                <label htmlFor="lead-name" className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                  Seu nome
                </label>
                <input
                  id="lead-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Como podemos te chamar?"
                />
              </div>

              <div>
                <label htmlFor="lead-phone" className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">
                  Telefone / WhatsApp
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="(81) 99999-9999"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-whatsapp text-white py-3.5 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <MessageCircle className="h-5 w-5" />
                {submitting ? "Conectando..." : "Continuar para o WhatsApp"}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Prefiro não informar agora
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
