import { useEffect, useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Globe, Smartphone, Monitor, Tablet, TrendingUp, Users, Eye, MousePointerClick, Share2 } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

interface TrafficEvent {
  id: string;
  channel: string;
  source: string;
  medium: string;
  social_network: string;
  device_type: string;
  browser: string;
  os: string;
  landing_page: string;
  event_type: string;
  created_at: string;
  campaign: string;
  visitor_id: string;
  session_id: string;
}

export default function TrafficTab() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "90d" | "custom">("today");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { from, to } = getDateRange();
      let query = supabase
        .from("traffic_events")
        .select("id, channel, source, medium, social_network, device_type, browser, os, landing_page, event_type, created_at, campaign, visitor_id, session_id")
        .gte("created_at", from);
      if (to) query = query.lte("created_at", to);
      const { data } = await query.order("created_at", { ascending: false }).limit(5000);
      setEvents(data || []);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customRange?.from?.toISOString(), customRange?.to?.toISOString()]);

  const stats = useMemo(() => {
    const pageViews = events.filter((e) => e.event_type === "page_view");
    const uniqueVisitors = new Set(events.map((e) => e.visitor_id)).size;
    const sessions = new Set(events.map((e) => e.session_id)).size;
    const whatsappClicks = events.filter((e) => e.event_type === "whatsapp_click").length;

    // By channel
    const byChannel: Record<string, number> = {};
    pageViews.forEach((e) => { byChannel[e.channel] = (byChannel[e.channel] || 0) + 1; });

    // By source
    const bySource: Record<string, number> = {};
    pageViews.forEach((e) => { bySource[e.source] = (bySource[e.source] || 0) + 1; });

    // By device
    const byDevice: Record<string, number> = {};
    pageViews.forEach((e) => { byDevice[e.device_type] = (byDevice[e.device_type] || 0) + 1; });

    // By browser
    const byBrowser: Record<string, number> = {};
    pageViews.forEach((e) => { byBrowser[e.browser] = (byBrowser[e.browser] || 0) + 1; });

    // By OS
    const byOS: Record<string, number> = {};
    pageViews.forEach((e) => { byOS[e.os] = (byOS[e.os] || 0) + 1; });

    // By social network (only social traffic)
    const bySocial: Record<string, number> = {};
    pageViews.filter((e) => e.social_network).forEach((e) => {
      bySocial[e.social_network] = (bySocial[e.social_network] || 0) + 1;
    });

    // Top landing pages
    const byPage: Record<string, number> = {};
    pageViews.forEach((e) => { byPage[e.landing_page] = (byPage[e.landing_page] || 0) + 1; });

    // By day
    const byDay: Record<string, number> = {};
    pageViews.forEach((e) => {
      const day = e.created_at.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });

    // By campaign
    const byCampaign: Record<string, number> = {};
    pageViews.filter((e) => e.campaign).forEach((e) => {
      byCampaign[e.campaign] = (byCampaign[e.campaign] || 0) + 1;
    });

    const sortDesc = (obj: Record<string, number>) =>
      Object.entries(obj).sort(([, a], [, b]) => b - a);

    return {
      totalPageViews: pageViews.length,
      uniqueVisitors,
      sessions,
      whatsappClicks,
      byChannel: sortDesc(byChannel),
      bySource: sortDesc(bySource).slice(0, 10),
      byDevice: sortDesc(byDevice),
      byBrowser: sortDesc(byBrowser).slice(0, 6),
      byOS: sortDesc(byOS).slice(0, 6),
      bySocial: sortDesc(bySocial),
      byPage: sortDesc(byPage).slice(0, 10),
      byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)),
      byCampaign: sortDesc(byCampaign).slice(0, 5),
    };
  }, [events]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const deviceIcons: Record<string, typeof Monitor> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Globe className="h-5 w-5 text-accent" /> Módulo de Tráfego
      </h2>

      {/* Period filter */}
      <div className="flex flex-wrap gap-2 items-center">
        {(["today", "7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
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
          { icon: Eye, label: "Page Views", value: stats.totalPageViews, color: "text-blue-500" },
          { icon: Users, label: "Visitantes Únicos", value: stats.uniqueVisitors, color: "text-green-500" },
          { icon: TrendingUp, label: "Sessões", value: stats.sessions, color: "text-accent" },
          { icon: MousePointerClick, label: "Cliques WhatsApp", value: stats.whatsappClicks, color: "text-primary" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-card border border-border">
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Traffic by Day chart */}
      <div className="p-5 rounded-xl bg-card border border-border">
        <h3 className="font-bold mb-4 text-sm">📈 Visitas por Dia</h3>
        {stats.byDay.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem dados no período.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {stats.byDay.slice(-30).map(([date, count]) => {
              const maxVal = Math.max(...stats.byDay.map(([, c]) => c), 1);
              return (
                <div key={date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-6 hidden group-hover:block text-[10px] bg-foreground text-background px-2 py-0.5 rounded whitespace-nowrap z-10">
                    {date.slice(5)}: {count}
                  </div>
                  <div
                    className="w-full bg-primary rounded-t-sm min-h-[2px] transition-all"
                    style={{ height: `${(count / maxVal) * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Channel */}
        <RankingCard title="📊 Por Canal" data={stats.byChannel} color="from-primary to-accent" />

        {/* By Source */}
        <RankingCard title="🔗 Por Origem" data={stats.bySource} color="from-blue-500 to-cyan-400" />

        {/* By Social */}
        <RankingCard title="📱 Redes Sociais" data={stats.bySocial} color="from-pink-500 to-purple-500" />

        {/* By Device */}
        <div className="p-5 rounded-xl bg-card border border-border">
          <h3 className="font-bold mb-4 text-sm">💻 Dispositivos</h3>
          {stats.byDevice.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem dados.</p>
          ) : (
            <div className="space-y-3">
              {stats.byDevice.map(([name, count]) => {
                const DeviceIcon = deviceIcons[name] || Monitor;
                const total = stats.totalPageViews || 1;
                const pct = ((count / total) * 100).toFixed(1);
                return (
                  <div key={name} className="flex items-center gap-3">
                    <DeviceIcon className="h-5 w-5 text-accent shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{name}</span>
                        <span className="font-bold">{count} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent to-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browser + OS */}
        <RankingCard title="🌐 Navegadores" data={stats.byBrowser} color="from-green-500 to-emerald-400" />
        <RankingCard title="🖥️ Sistema Operacional" data={stats.byOS} color="from-orange-500 to-yellow-400" />

        {/* Top Pages */}
        <RankingCard title="📄 Páginas Mais Acessadas" data={stats.byPage} color="from-violet-500 to-blue-400" />

        {/* Campaigns */}
        {stats.byCampaign.length > 0 && (
          <RankingCard title="🎯 Campanhas UTM" data={stats.byCampaign} color="from-red-500 to-pink-400" />
        )}
      </div>
    </div>
  );
}

function RankingCard({ title, data, color }: { title: string; data: [string, number][]; color: string }) {
  const maxVal = Math.max(...data.map(([, c]) => c), 1);

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h3 className="font-bold mb-4 text-sm">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sem dados no período.</p>
      ) : (
        <div className="space-y-3">
          {data.map(([name, count]) => (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate max-w-[200px]">{name || "(vazio)"}</span>
                <span className="font-bold text-accent">{count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
                  style={{ width: `${(count / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
