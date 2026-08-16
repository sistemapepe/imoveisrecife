import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, MessageCircle, Calendar, TrendingUp, Download } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";
import { DateRangePicker } from "./DateRangePicker";
import { downloadCSV } from "@/lib/csv-export";

interface ViewsByProperty {
  property_id: string;
  title: string;
  count: number;
}

interface LeadsByPeriod {
  date: string;
  count: number;
}

export default function AnalyticsTab({ isNetwork = false }: { isNetwork?: boolean }) {
  const { site } = useSite();
  const [totalViews, setTotalViews] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [viewsByProperty, setViewsByProperty] = useState<ViewsByProperty[]>([]);
  const [leadsByDay, setLeadsByDay] = useState<LeadsByPeriod[]>([]);
  const [viewsByDay, setViewsByDay] = useState<LeadsByPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "90d" | "custom">("today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const cacheKey = `analytics_${isNetwork ? 'global' : site?.id}_${period}_${customRange?.from?.toISOString()}_${customRange?.to?.toISOString()}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        setTotalViews(data.totalViews);
        setTotalLeads(data.totalLeads);
        setTotalVisits(data.totalVisits);
        setViewsByProperty(data.viewsByProperty);
        setViewsByDay(data.viewsByDay);
        setLeadsByDay(data.leadsByDay);
        
        // Se o cache for recente (< 5 min), não mostra loading
        if (Date.now() - timestamp < 300000) {
          setLoading(false);
          // Opcional: faz o fetch em background para atualizar
          fetchAnalytics(cacheKey, false);
          return;
        }
      } catch (e) {}
    }

    fetchAnalytics(cacheKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customRange?.from?.toISOString(), customRange?.to?.toISOString(), site?.id, isNetwork]);

  const getDateRange = (): { from: string; to?: string } => {
    if (period === "custom" && customRange?.from) {
      const from = new Date(customRange.from);
      from.setHours(0, 0, 0, 0);
      const to = customRange.to ? new Date(customRange.to) : new Date(customRange.from);
      to.setHours(23, 59, 59, 999);
      return { from: from.toISOString(), to: to.toISOString() };
    }
    if (period === "today") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return { from: d.toISOString() };
    }
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return { from: d.toISOString() };
  };

  const fetchAnalytics = async (cacheKey?: string, showLoading = true) => {
    if (showLoading) setLoading(true);
    const { from, to } = getDateRange();

    const applyRange = <T,>(q: T): T => {
      let qq = q as any;
      if (to) qq = qq.lte("created_at", to);
      if (!isNetwork && site?.id) qq = qq.eq("site_id", site.id);
      return qq;
    };

    const applySiteFilter = <T,>(q: T): T => {
      let qq = q as any;
      if (!isNetwork && site?.id) qq = qq.eq("site_id", site.id);
      return qq;
    };

    const [viewsRes, leadsRes, visitsRes, propertiesRes] = await Promise.all([
      applyRange(supabase.from("property_views").select("id, property_id, created_at").gte("created_at", from)),
      applyRange(supabase.from("contact_messages").select("id, created_at").gte("created_at", from)),
      applyRange(supabase.from("visit_requests").select("id, created_at").gte("created_at", from)),
      applySiteFilter(supabase.from("properties").select("id, title")),
    ]);

    const views = viewsRes.data || [];
    const leads = leadsRes.data || [];
    const visits = visitsRes.data || [];
    const properties = propertiesRes.data || [];

    setTotalViews(views.length);
    setTotalLeads(leads.length);
    setTotalVisits(visits.length);

    // Views by property
    const viewCount: Record<string, number> = {};
    views.forEach((v) => { viewCount[v.property_id] = (viewCount[v.property_id] || 0) + 1; });
    const viewsByProp = Object.entries(viewCount)
      .map(([pid, count]) => ({
        property_id: pid,
        title: properties.find((p) => p.id === pid)?.title || "Imóvel removido",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setViewsByProperty(viewsByProp);

    // Group by day
    const groupByDay = (items: { created_at: string }[]) => {
      const map: Record<string, number> = {};
      items.forEach((item) => {
        const day = item.created_at.slice(0, 10);
        map[day] = (map[day] || 0) + 1;
      });
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));
    };

    setViewsByDay(groupByDay(views));
    setLeadsByDay(groupByDay(leads));
    setLoading(false);

    if (cacheKey) {
      const cacheData = {
        totalViews: views.length,
        totalLeads: leads.length,
        totalVisits: visits.length,
        viewsByProperty: viewsByProp,
        viewsByDay: groupByDay(views),
        leadsByDay: groupByDay(leads)
      };
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: cacheData, timestamp: Date.now() }));
    }
  };

  const maxBarValue = Math.max(...viewsByProperty.map((v) => v.count), 1);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex flex-wrap gap-2 items-center">
        {(["today", "7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              period === p
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {p === "today" ? "Hoje" : p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
          </button>
        ))}
        <DateRangePicker
          value={customRange}
          onChange={(r) => {
            setCustomRange(r);
            if (r?.from) setPeriod("custom");
          }}
        />
        <button
          onClick={() => {
            const stamp = new Date().toISOString().slice(0, 10);
            const summary = [
              { metrica: "Visualizações", valor: totalViews },
              { metrica: "Leads", valor: totalLeads },
              { metrica: "Agendamentos", valor: totalVisits },
              { metrica: "Conversão (%)", valor: totalViews > 0 ? ((totalLeads + totalVisits) / totalViews * 100).toFixed(2) : "0" },
              {},
              { metrica: "— Top Imóveis Visualizados —", valor: "" },
              ...viewsByProperty.map((v) => ({ metrica: v.title, valor: v.count })),
              {},
              { metrica: "— Visualizações por Dia —", valor: "" },
              ...viewsByDay.map((d) => ({ metrica: d.date, valor: d.count })),
              {},
              { metrica: "— Leads por Dia —", valor: "" },
              ...leadsByDay.map((d) => ({ metrica: d.date, valor: d.count })),
            ];
            downloadCSV(
              summary,
              `analytics_${period}_${stamp}.csv`,
              [
                { key: "metrica", label: "Métrica" },
                { key: "valor", label: "Valor" },
              ],
            );
          }}
          disabled={totalViews === 0 && totalLeads === 0 && totalVisits === 0}
          className="ml-auto h-9 px-4 rounded-full text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: "Visualizações", value: totalViews, color: "text-blue-500" },
          { icon: MessageCircle, label: "Leads", value: totalLeads, color: "text-green-500" },
          { icon: Calendar, label: "Agendamentos", value: totalVisits, color: "text-accent" },
          { icon: TrendingUp, label: "Conversão", value: totalViews > 0 ? `${((totalLeads + totalVisits) / totalViews * 100).toFixed(1)}%` : "0%", color: "text-primary" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-black/40 border border-white/5">
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <div className="text-2xl font-extrabold text-accent">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Views by Property */}
      <div className="p-5 rounded-xl bg-black/40 border border-white/5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" /> Top Imóveis Visualizados
        </h3>
        {viewsByProperty.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma visualização registrada no período.</p>
        ) : (
          <div className="space-y-3">
            {viewsByProperty.map((item) => (
              <div key={item.property_id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate max-w-[200px]">{item.title}</span>
                  <span className="font-bold text-accent">{item.count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${(item.count / maxBarValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimelineChart title="Visualizações por Dia" data={viewsByDay} color="bg-primary" />
        <TimelineChart title="Leads por Dia" data={leadsByDay} color="bg-green-500" />
      </div>
    </div>
  );
}

function TimelineChart({ title, data, color }: { title: string; data: LeadsByPeriod[]; color: string }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="p-5 rounded-xl bg-black/40 border border-white/5">
      <h3 className="font-bold mb-4 text-sm">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sem dados no período.</p>
      ) : (
        <div className="flex items-end gap-1 h-32">
          {data.slice(-30).map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className="absolute -top-6 hidden group-hover:block text-[10px] bg-foreground text-background px-2 py-0.5 rounded whitespace-nowrap z-10">
                {d.date.slice(5)}: {d.count}
              </div>
              <div
                className={`w-full ${color} rounded-t-sm min-h-[2px] transition-all`}
                style={{ height: `${(d.count / maxVal) * 100}%` }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
