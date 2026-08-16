import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Globe2, Users, Building2, TrendingUp, ShieldCheck, Activity, Rocket, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function NetworkDashboard() {
  const [stats, setStats] = useState({
    sites: 0,
    properties: 0,
    users: 0,
    leads: 0,
    loading: true
  });
  const [recentSites, setRecentSites] = useState<any[]>([]);

  useEffect(() => {
    const cached = sessionStorage.getItem("network_global_stats");
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        if (data) {
          setStats({ ...data, loading: false });
        }
      } catch (e) {}
    }
    fetchStats(false);
    fetchRecentSites();
  }, []);

  const fetchRecentSites = async () => {
    try {
      const { data } = await supabase
        .from("sites")
        .select("id, brand_name, domain, publish_status, last_published_at")
        .order("last_published_at", { ascending: false, nullsFirst: false })
        .limit(5);
      
      if (data) setRecentSites(data);
    } catch (error) {
      console.error("Erro ao buscar sites recentes:", error);
    }
  };

  const fetchStats = async (forceLoading = false) => {
    try {
      if (forceLoading) setStats(prev => ({ ...prev, loading: true }));
      
      const [sitesRes, propertiesRes, usersRes, leadsRes] = await Promise.all([
        supabase.from("sites").select("id", { count: 'exact', head: true }),
        supabase.from("properties").select("id", { count: 'exact', head: true }),
        supabase.from("user_roles").select("user_id", { count: 'exact', head: true }),
        supabase.from("contact_messages").select("id", { count: 'exact', head: true })
      ]);

      const newStats = {
        sites: sitesRes.count || 0,
        properties: propertiesRes.count || 0,
        users: usersRes.count || 0,
        leads: leadsRes.count || 0,
      };

      setStats({ ...newStats, loading: false });
      sessionStorage.setItem("network_global_stats", JSON.stringify({ data: newStats, timestamp: Date.now() }));
    } catch (error) {
      console.error("Erro ao buscar estatísticas de rede:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    { label: "Total de Sites", value: stats.sites, icon: Globe2, color: "text-accent" },
    { label: "Imóveis na Rede", value: stats.properties, icon: Building2, color: "text-blue-400" },
    { label: "Usuários Ativos", value: stats.users, icon: Users, color: "text-purple-400" },
    { label: "Leads Captados", value: stats.leads, icon: TrendingUp, color: "text-green-400" },
  ];

  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/10">
            <Activity className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-accent">Gestão de Rede</h2>
        </div>
        <p className="text-accent/70 text-lg max-w-2xl">Visualização consolidada de toda a infraestrutura multi-tenant e performance global.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#0d1419] border-white/5 hover:border-accent/30 transition-all group overflow-hidden relative rounded-[2rem] premium-shadow-hover">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stats.loading ? (
                    <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
                  ) : (
                    <span className="text-3xl font-serif font-bold text-accent">{stat.value}</span>
                  )}
                </div>
                <h3 className="text-[9px] uppercase tracking-[0.3em] font-extrabold text-accent/60">{stat.label}</h3>
                
                <div className={`absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity`}>
                   <stat.icon className="w-24 h-24" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-serif font-bold text-accent flex items-center gap-2">
            <Rocket className="w-5 h-5" /> Status de Publicação Recente
          </h3>
          <div className="bg-[#0d1419] border border-white/10 rounded-[2.5rem] overflow-hidden premium-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] font-extrabold text-accent/40">
                    <th className="px-6 py-4">Site</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Última Publicação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSites.length > 0 ? (
                    recentSites.map((site) => (
                      <tr key={site.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white group-hover:text-accent transition-colors">{site.brand_name}</div>
                          <div className="text-[9px] text-white/20 font-mono tracking-wider">{site.domain}</div>
                        </td>
                        <td className="px-6 py-4">
                          {site.publish_status === 'published' ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase border border-blue-500/10">
                              <Rocket className="h-3 w-3" /> Publicado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase border border-amber-500/10">
                              <Clock className="h-3 w-3" /> Rascunho
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                          {site.last_published_at ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {new Date(site.last_published_at).toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-white/10 italic">Nunca publicado</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                        Nenhum site encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
             <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-accent">Banco de Dados</h4>
                  <p className="text-xs text-accent/70">Conexão estável e latência otimizada.</p>
                </div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-accent">Serviços de Auth</h4>
                  <p className="text-xs text-accent/70">Provedores de identidade operacionais.</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="bg-[#0d1419] border border-white/10 rounded-[2.5rem] p-8 space-y-6 premium-shadow">
          <h3 className="text-xl font-serif font-bold text-accent">Configurações Rápidas</h3>
          <div className="space-y-4">
            <p className="text-sm text-accent/70 leading-relaxed">
              Você está operando como Administrador Global. Todas as alterações nesta área impactam múltiplos sites simultaneamente.
            </p>
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-accent/70">Versão da Rede</span>
                <span className="text-accent font-bold">v2.4.0-gold</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-accent/70">Último Backup</span>
                <span className="text-accent font-bold">Há 12 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}