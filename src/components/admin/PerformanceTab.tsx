import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Gauge, Zap, Layout, Clock, Smartphone, Monitor, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PerfLog {
  metric_name: string;
  metric_value: number;
  device_type: string;
  page_url: string;
  created_at: string;
}

export default function PerformanceTab() {
  const [logs, setLogs] = useState<PerfLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('performance_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      setLogs((data as any) || []);
      setLoading(false);
    }
    load();
  }, []);

  const getAvg = (name: string, device?: string) => {
    const filtered = logs.filter(l => l.metric_name === name && (!device || l.device_type === device));
    if (filtered.length === 0) return 0;
    return filtered.reduce((acc, l) => acc + l.metric_value, 0) / filtered.length;
  };

  const metrics = [
    { name: 'LCP', label: 'Largest Contentful Paint', unit: 'ms', target: 2500, icon: Zap },
    { name: 'CLS', label: 'Cumulative Layout Shift', unit: '', target: 0.1, icon: Layout },
    { name: 'INP', label: 'Interaction to Next Paint', unit: 'ms', target: 200, icon: Clock },
    { name: 'FCP', label: 'First Contentful Paint', unit: 'ms', target: 1800, icon: Zap },
    { name: 'TTFB', label: 'Time to First Byte', unit: 'ms', target: 800, icon: Gauge },
  ];

  if (loading) return <div className="p-8 text-center animate-pulse">Carregando métricas de performance...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" /> Performance & Core Web Vitals
          </h2>
          <p className="text-sm text-muted-foreground">Monitoramento em tempo real da experiência do usuário.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => {
          const avgMobile = getAvg(m.name, 'mobile');
          const avgDesktop = getAvg(m.name, 'desktop');
          const Icon = m.icon;
          
          const isGood = (val: number) => val > 0 && val <= m.target;
          const isBad = (val: number) => val > m.target * 2;

          return (
            <Card key={m.name} className="overflow-hidden border-border/50">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-background border shadow-sm">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-bold">{m.name}</CardTitle>
                  </div>
                  <span className="text-[10px] font-mono bg-background px-2 py-0.5 rounded-full border">
                    Target: {m.target}{m.unit}
                  </span>
                </div>
                <CardDescription className="text-[10px] line-clamp-1">{m.label}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Smartphone className="h-3 w-3" /> Mobile
                  </div>
                  <div className={`text-xl font-black ${avgMobile === 0 ? 'text-muted' : isGood(avgMobile) ? 'text-green-500' : isBad(avgMobile) ? 'text-destructive' : 'text-yellow-600'}`}>
                    {avgMobile > 0 ? (m.name === 'CLS' ? avgMobile.toFixed(3) : Math.round(avgMobile)) : '—'}
                    {avgMobile > 0 && m.unit}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Monitor className="h-3 w-3" /> Desktop
                  </div>
                  <div className={`text-xl font-black ${avgDesktop === 0 ? 'text-muted' : isGood(avgDesktop) ? 'text-green-500' : isBad(avgDesktop) ? 'text-destructive' : 'text-yellow-600'}`}>
                    {avgDesktop > 0 ? (m.name === 'CLS' ? avgDesktop.toFixed(3) : Math.round(avgDesktop)) : '—'}
                    {avgDesktop > 0 && m.unit}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" /> Histórico Recente (1000 eventos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[300px] overflow-y-auto rounded-lg border bg-muted/20">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-background border-b z-10">
                <tr>
                  <th className="p-2 font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="p-2 font-bold uppercase tracking-wider text-muted-foreground">Métrica</th>
                  <th className="p-2 font-bold uppercase tracking-wider text-muted-foreground">Valor</th>
                  <th className="p-2 font-bold uppercase tracking-wider text-muted-foreground">Disp.</th>
                  <th className="p-2 font-bold uppercase tracking-wider text-muted-foreground">Página</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleTimeString()}</td>
                    <td className="p-2 font-bold">{l.metric_name}</td>
                    <td className="p-2 font-mono">{l.metric_value.toFixed(l.metric_name === 'CLS' ? 3 : 0)}</td>
                    <td className="p-2">
                      {l.device_type === 'mobile' ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                    </td>
                    <td className="p-2 truncate max-w-[150px]">{l.page_url}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                      Nenhum dado de performance coletado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <AlertCircle className="h-5 w-5 text-primary shrink-0" />
        <p className="text-xs text-primary/80 leading-relaxed">
          <strong>Dica de Otimização:</strong> Se o seu <strong>LCP</strong> estiver acima de 2500ms no Mobile, verifique o tamanho das imagens destacadas e use pre-load para o banner principal. Para <strong>CLS</strong>, certifique-se de definir dimensões explícitas para elementos que carregam após o primeiro render.
        </p>
      </div>
    </div>
  );
}
