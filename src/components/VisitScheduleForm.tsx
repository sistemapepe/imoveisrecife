import { useState } from "react";
import { Calendar, Clock, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const visitSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  preferred_date: z.string().min(1, "Selecione uma data"),
  preferred_time: z.string().min(1, "Selecione um horário"),
  message: z.string().max(500).optional(),
});

interface VisitScheduleFormProps {
  propertyId: string;
  propertyTitle: string;
}

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export default function VisitScheduleForm({ propertyId, propertyTitle }: VisitScheduleFormProps) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    preferred_date: "", preferred_time: "", message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = visitSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("visit_requests").insert({
        property_id: propertyId,
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        preferred_date: result.data.preferred_date,
        preferred_time: result.data.preferred_time,
        message: result.data.message || "",
      });

      if (error) throw error;
      setSuccess(true);
      toast.success("Visita agendada com sucesso!");
    } catch {
      toast.error("Erro ao agendar visita. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="text-lg font-bold">Visita Agendada!</h3>
        <p className="text-sm text-muted-foreground">
          Entraremos em contato para confirmar sua visita ao imóvel <strong>{propertyTitle}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-accent" /> Agendar Visita
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-2xl bg-card border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nome *</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Seu nome completo"
              maxLength={100}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">E-mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="seu@email.com"
              maxLength={255}
            />
            {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email}</span>}
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Telefone *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="(81) 99999-9999"
              maxLength={20}
            />
            {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Data preferida *</label>
            <input
              type="date"
              value={form.preferred_date}
              onChange={(e) => handleChange("preferred_date", e.target.value)}
              min={today}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {errors.preferred_date && <span className="text-xs text-red-500 mt-1">{errors.preferred_date}</span>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Horário preferido *
          </label>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleChange("preferred_time", time)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  form.preferred_time === time
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {errors.preferred_time && <span className="text-xs text-red-500 mt-1">{errors.preferred_time}</span>}
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mensagem (opcional)</label>
          <textarea
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px] resize-none"
            placeholder="Alguma observação?"
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl gold-gradient py-3.5 text-accent-foreground font-bold text-sm active:scale-95 transition-transform uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" /> Solicitar Agendamento
            </>
          )}
        </button>
      </form>
    </div>
  );
}
