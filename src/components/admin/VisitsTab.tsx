import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, CheckCircle, Clock, XCircle, Phone, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface VisitRequest {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: string;
  created_at: string;
  property_title?: string;
}

export default function VisitsTab() {
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("visit_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const propIds = [...new Set(data.map((v) => v.property_id))];
      const { data: props } = await supabase
        .from("properties")
        .select("id, title")
        .in("id", propIds);

      const enriched = data.map((v) => ({
        ...v,
        property_title: props?.find((p) => p.id === v.property_id)?.title || "Imóvel removido",
      }));
      setVisits(enriched);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("visit_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }

    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    toast.success(`Visita ${status === "confirmed" ? "confirmada" : "cancelada"}!`);
  };

  const filtered = filter === "all" ? visits : visits.filter((v) => v.status === filter);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    confirmed: "bg-green-500/20 text-green-700 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-2xl text-accent tracking-[0.2em] uppercase">Visitas</h2>
        <button
          onClick={fetchVisits}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-luxury-dark text-[10px] font-extrabold uppercase tracking-widest hover:bg-accent/80 transition-all shadow-lg shadow-accent/20"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f === "all" ? `Todas (${visits.length})` : `${statusLabels[f]} (${visits.filter((v) => v.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        filtered.map((visit) => (
          <div key={visit.id} className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm">{visit.name}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[250px]">{visit.property_title}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[visit.status] || statusColors.pending}`}>
                {statusLabels[visit.status] || visit.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {new Date(visit.preferred_date).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {visit.preferred_time}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {visit.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {visit.phone}
              </div>
            </div>

            {visit.message && (
              <p className="text-xs text-muted-foreground bg-secondary p-2 rounded-lg">{visit.message}</p>
            )}

            {visit.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(visit.id, "confirmed")}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500/20 text-green-700 text-xs font-bold hover:bg-green-500/30 transition"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Confirmar
                </button>
                <button
                  onClick={() => updateStatus(visit.id, "cancelled")}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-500/20 text-red-700 text-xs font-bold hover:bg-red-500/30 transition"
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancelar
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
