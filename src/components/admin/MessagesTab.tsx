import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, Tag, RefreshCw, MessageSquareText } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  source: string;
  created_at: string;
}

const SOURCE_LABELS: Record<string, { label: string; cls: string }> = {
  contato: { label: "Form Contato", cls: "bg-primary/10 text-primary" },
  form_contato: { label: "Form Contato", cls: "bg-primary/10 text-primary" },
  whatsapp_fab: { label: "WhatsApp", cls: "bg-whatsapp/10 text-whatsapp" },
  whatsapp_fab_global: { label: "WhatsApp", cls: "bg-whatsapp/10 text-whatsapp" },
  whatsapp_fab_property: { label: "WhatsApp Imóvel", cls: "bg-whatsapp/10 text-whatsapp" },
};

function sourceBadge(source: string) {
  return SOURCE_LABELS[source] || { label: source || "—", cls: "bg-muted text-muted-foreground" };
}

interface MessagesTabProps {
  onNewMessage?: () => void;
}

export default function MessagesTab({ onNewMessage }: MessagesTabProps) {
  const { site } = useSite();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!site?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("site_id", site.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar mensagens");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (site?.id) fetchMessages();
  }, [fetchMessages, site?.id]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!site?.id) return;
    const channel = supabase
      .channel(`contact_messages_${site.id}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "contact_messages",
          filter: `site_id=eq.${site.id}`
        },
        (payload) => {
          const newMsg = payload.new as ContactMessage;
          setMessages((prev) => [newMsg, ...prev]);
          toast.info(`Nova mensagem de ${newMsg.name}`);
          onNewMessage?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewMessage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-2xl text-accent tracking-[0.2em] uppercase">Mensagens</h2>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-luxury-dark text-[10px] font-extrabold uppercase tracking-widest hover:bg-accent/80 transition-all shadow-lg shadow-accent/20"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem recebida</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-[#0d1419] rounded-[2rem] border border-white/5 p-6 space-y-4 premium-shadow hover:border-accent/30 transition-all duration-500 group">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-white tracking-wide group-hover:text-accent transition-colors">{msg.name}</h3>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/20 whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground items-center">
                {(() => {
                  const b = sourceBadge(msg.source);
                  return (
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-[0.2em] border border-white/5 ${b.cls.replace('text-primary', 'text-accent').replace('text-whatsapp', 'text-green-500')}`}>
                      {b.label}
                    </span>
                  );
                })()}
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${msg.email}`} className="text-white/60 hover:text-accent transition-colors">{msg.email}</a>
                </span>
                {msg.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${msg.phone}`} className="text-white/60 hover:text-accent transition-colors">{msg.phone}</a>
                  </span>
                )}
                {msg.interest && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> {msg.interest}
                  </span>
                )}
              </div>
              {msg.message && (
                <div className="flex gap-3 mt-3 pt-4 border-t border-white/5">
                  <MessageSquareText className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 leading-relaxed font-medium">{msg.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
