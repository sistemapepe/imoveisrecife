import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProperties } from "@/contexts/PropertyContext";
import { useSite } from "@/contexts/SiteContext";
import { Building2, MessageSquare, Calendar, Eye, TrendingDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
  const { site } = useSite();
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
    let mounted = true;
    const load = async () => {
      if (!site?.id) return;
      
      const cacheKey = `dashboard_stats_${site.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 60000) {
            setStats(data);
            setLoading(false);
          }
        } catch (e) {}
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isoWeek = sevenDaysAgo.toISOString();

      try {
        const fetchC = async () => {
          const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("site_id", site.id).gte("created_at", isoWeek);
          return count ?? 0;
        };
        const fetchV = async () => {
          const { count } = await supabase.from("visit_requests").select("id", { count: "exact", head: true }).eq("site_id", site.id).eq("status", "pending");
          return count ?? 0;
        };
        const fetchW = async () => {
          const { count } = await supabase.from("property_views").select("id", { count: "exact", head: true }).eq("site_id", site.id).gte("created_at", isoWeek);
          return count ?? 0;
        };

        const [cCount, vCount, wCount] = await Promise.all([fetchC(), fetchV(), fetchW()]);

        if (!mounted) return;

        const newStats = {
          totalProperties: properties.length,
          newContacts: cCount,
          pendingVisits: vCount,
          weekViews: wCount,
          priceDrops: properties.filter((p) => !!p.previous_price && p.previous_price > p.price).length,
          exclusives: properties.filter((p) => p.exclusive).length,
        };

        setStats(newStats);
        localStorage.setItem(cacheKey, JSON.stringify({ data: newStats, timestamp: Date.now() }));
      } catch (e) {
        console.error("Dashboard stats error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [properties, site?.id]);

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

  const memoCards = useMemo(() => cards, [stats, loading, onNavigate]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resumo</h2>
        <p className="text-sm text-muted-foreground">Panorama geral do seu portfólio.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {memoCards.map((card, i) => {
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
