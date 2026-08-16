import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, Tag, RefreshCw, MessageSquareText } from "lucide-react";

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
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar mensagens");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel("contact_messages_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
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
        <h2 className="text-lg font-bold">Mensagens de Contato</h2>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
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
            <div key={msg.id} className="bg-card rounded-xl border border-border p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">{msg.name}</h3>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
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
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${b.cls}`}>
                      {b.label}
                    </span>
                  );
                })()}
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>
                </span>
                {msg.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${msg.phone}`} className="text-primary hover:underline">{msg.phone}</a>
                  </span>
                )}
                {msg.interest && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> {msg.interest}
                  </span>
                )}
              </div>
              {msg.message && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                  <MessageSquareText className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/80 leading-relaxed">{msg.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
