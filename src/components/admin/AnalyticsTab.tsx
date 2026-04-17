import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, MessageCircle, Calendar, TrendingUp } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

interface ViewsByProperty {
  property_id: string;
  title: string;
  count: number;
}

interface LeadsByPeriod {
  date: string;
  count: number;
}

export default function AnalyticsTab() {
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
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customRange?.from?.toISOString(), customRange?.to?.toISOString()]);

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

  const fetchAnalytics = async () => {
    setLoading(true);
    const { from, to } = getDateRange();

    const buildQuery = (table: "property_views" | "contact_messages" | "visit_requests", cols: string) => {
      let q = supabase.from(table).select(cols).gte("created_at", from);
      if (to) q = q.lte("created_at", to);
      return q;
    };

    const [viewsRes, leadsRes, visitsRes, propertiesRes] = await Promise.all([
      buildQuery("property_views", "id, property_id, created_at"),
      buildQuery("contact_messages", "id, created_at"),
      buildQuery("visit_requests", "id, created_at"),
      supabase.from("properties").select("id, title"),
    ]);

    const views = (viewsRes.data || []) as { id: string; property_id: string; created_at: string }[];
    const leads = (leadsRes.data || []) as { id: string; created_at: string }[];
    const visits = (visitsRes.data || []) as { id: string; created_at: string }[];
    const properties = (propertiesRes.data || []) as { id: string; title: string }[];

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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: "Visualizações", value: totalViews, color: "text-blue-500" },
          { icon: MessageCircle, label: "Leads", value: totalLeads, color: "text-green-500" },
          { icon: Calendar, label: "Agendamentos", value: totalVisits, color: "text-accent" },
          { icon: TrendingUp, label: "Conversão", value: totalViews > 0 ? `${((totalLeads + totalVisits) / totalViews * 100).toFixed(1)}%` : "0%", color: "text-primary" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-card border border-border">
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Views by Property */}
      <div className="p-5 rounded-xl bg-card border border-border">
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
    <div className="p-5 rounded-xl bg-card border border-border">
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
