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
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isoWeek = sevenDaysAgo.toISOString();

      try {
        const fetchC = async () => {
          const { count, error } = await supabase.from("contact_messages").select("id", { count: "exact", head: true })
            .eq("site_id", site.id)
            .gte("created_at", isoWeek);
          if (error) throw error;
          return count ?? 0;
        };
        const fetchV = async () => {
          // Join with properties to filter by site_id since visit_requests might not have it
          const { count, error } = await supabase
            .from("visit_requests")
            .select("id, properties!inner(site_id)", { count: "exact", head: true })
            .eq("properties.site_id", site.id)
            .eq("status", "pending");
          if (error) throw error;
          return count ?? 0;
        };
        const fetchW = async () => {
          // Join with properties to filter by site_id
          const { count, error } = await supabase
            .from("property_views")
            .select("id, properties!inner(site_id)", { count: "exact", head: true })
            .eq("properties.site_id", site.id)
            .gte("created_at", isoWeek);
          if (error) throw error;
          return count ?? 0;
        };

        const fetchP = async () => {
          const { count, error } = await supabase.from("properties").select("id", { count: "exact", head: true })
            .eq("site_id", site.id);
          if (error) throw error;
          return count ?? 0;
        };

        const [cCount, vCount, wCount, pCount] = await Promise.all([fetchC(), fetchV(), fetchW(), fetchP()]);

        if (!mounted) return;

        const newStats = {
          totalProperties: pCount,
          newContacts: cCount,
          pendingVisits: vCount,
          weekViews: wCount,
          priceDrops: properties.filter((p) => !!p.previous_price && Number(p.previous_price) > Number(p.price)).length,
          exclusives: properties.filter((p) => p.exclusive).length,
        };

        setStats(newStats);
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
        <h2 className="font-serif font-bold text-3xl text-accent tracking-[0.2em] uppercase">Resumo</h2>
        <p className="text-[10px] text-white/40 font-extrabold uppercase tracking-widest mt-2">Panorama geral do seu portfólio.</p>
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
               className={`text-left p-6 md:p-8 rounded-[2rem] bg-[#0d1419] border ${
                card.highlight ? "border-red-500/40" : "border-white/5"
              } premium-shadow hover:border-accent/30 transition-all duration-500`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-5 border border-white/5 group-hover:border-accent/20 transition-colors`}>
                <Icon className={`h-5 w-5 ${card.accent.replace('text-primary', 'text-white/70')}`} />
              </div>
              <div className="text-3xl md:text-4xl font-serif font-bold text-white leading-none">
                {loading ? "—" : card.value.toLocaleString("pt-BR")}
              </div>
              <div className="text-[9px] text-white/30 mt-3 font-extrabold uppercase tracking-[0.2em]">{card.label}</div>
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-[2.5rem] bg-[#0d1419] border border-white/5 p-8 premium-shadow">
        <h3 className="font-serif font-bold text-xl mb-6 text-accent">Atalhos rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate("properties")}
            className="text-[10px] font-extrabold uppercase tracking-widest py-4 px-3 rounded-2xl bg-accent text-luxury-dark hover:bg-accent/80 transition-all shadow-lg shadow-accent/20"
          >
            + Novo imóvel
          </button>
          <button
            onClick={() => onNavigate("visits")}
            className="text-[10px] font-extrabold uppercase tracking-widest py-4 px-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            Ver visitas
          </button>
          <button
            onClick={() => onNavigate("messages")}
            className="text-[10px] font-extrabold uppercase tracking-widest py-4 px-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            Ver contatos
          </button>
          <button
            onClick={() => onNavigate("analytics")}
            className="text-[10px] font-extrabold uppercase tracking-widest py-4 px-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
