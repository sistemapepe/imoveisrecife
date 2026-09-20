import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProperties } from "@/contexts/PropertyContext";
import { Building2, MessageSquare, Calendar, Eye, TrendingDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTenant } from "@/contexts/TenantContext";

type Tab = "properties" | "settings" | "users" | "messages" | "privacy" | "analytics" | "visits" | "traffic";

interface Stats {
  totalProperties: number;
  newContacts: number;
  pendingVisits: number;
  weekViews: number;
  priceDrops: number;
  exclusives: number;
}

export default function DashboardTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { properties } = useProperties();
  const { siteId } = useTenant();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    newContacts: 0,
    pendingVisits: 0,
    weekViews: 0,
    priceDrops: 0,
    exclusives: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isoWeek = sevenDaysAgo.toISOString();

      const [contactsRes, visitsRes, viewsRes] = await Promise.all([
        (() => {
          const q = supabase
            .from("contact_messages")
            .select("id", { count: "exact", head: true })
            .gte("created_at", isoWeek);
          return siteId ? q.eq("site_id", siteId) : q;
        })(),
        (() => {
          const q = supabase
            .from("visit_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending");
          return siteId ? q.eq("site_id", siteId) : q;
        })(),
        (() => {
          const q = supabase
            .from("property_views")
            .select("id", { count: "exact", head: true })
            .gte("created_at", isoWeek);
          return siteId ? q.eq("site_id", siteId) : q;
        })(),
      ]);

      setStats({
        totalProperties: properties.length,
        newContacts: contactsRes.count ?? 0,
        pendingVisits: visitsRes.count ?? 0,
        weekViews: viewsRes.count ?? 0,
        priceDrops: properties.filter((p) => !!p.previous_price && p.previous_price > p.price).length,
        exclusives: properties.filter((p) => p.exclusive).length,
      });
      setLoading(false);
    };
    load();
  }, [properties, siteId]);

  const cards = [
    {
      label: "Imóveis cadastrados",
      value: stats.totalProperties,
      icon: Building2,
      tab: "properties" as Tab,
      accent: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Contatos (7 dias)",
      value: stats.newContacts,
      icon: MessageSquare,
      tab: "messages" as Tab,
      accent: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Visitas pendentes",
      value: stats.pendingVisits,
      icon: Calendar,
      tab: "visits" as Tab,
      accent: "text-destructive",
      bg: "bg-destructive/10",
      highlight: stats.pendingVisits > 0,
    },
    {
      label: "Visualizações (7 dias)",
      value: stats.weekViews,
      icon: Eye,
      tab: "analytics" as Tab,
      accent: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Imóveis em baixa",
      value: stats.priceDrops,
      icon: TrendingDown,
      tab: "properties" as Tab,
      accent: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Exclusivos",
      value: stats.exclusives,
      icon: Sparkles,
      tab: "properties" as Tab,
      accent: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resumo</h2>
        <p className="text-sm text-muted-foreground">Panorama geral do seu portfólio.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              type="button"
              onClick={() => onNavigate(card.tab)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`text-left p-4 md:p-5 rounded-2xl bg-card border ${
                card.highlight ? "border-destructive/40 ring-2 ring-destructive/20" : "border-border"
              } shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${card.accent}`} />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {loading ? "—" : card.value.toLocaleString("pt-BR")}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{card.label}</div>
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-card border border-border p-4 md:p-5">
        <h3 className="font-bold text-sm mb-3">Atalhos rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => onNavigate("properties")}
            className="text-sm font-semibold py-2.5 px-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            + Novo imóvel
          </button>
          <button
            onClick={() => onNavigate("visits")}
            className="text-sm font-semibold py-2.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Ver visitas
          </button>
          <button
            onClick={() => onNavigate("messages")}
            className="text-sm font-semibold py-2.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Ver contatos
          </button>
          <button
            onClick={() => onNavigate("analytics")}
            className="text-sm font-semibold py-2.5 px-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
