import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Globe2, Users, Building2, TrendingUp, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function NetworkDashboard() {
  const [stats, setStats] = useState({
    sites: 0,
    properties: 0,
    users: 0,
    leads: 0,
    loading: true
  });

  useEffect(() => {
    const cached = sessionStorage.getItem("network_global_stats");
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 60000) { // 60 segundos de cache
          setStats({ ...data, loading: false });
          // Ainda busca em background para atualizar se necessário
          fetchStats(false);
          return;
        }
      } catch (e) {}
    }
    fetchStats(true);
  }, []);

  const fetchStats = async (showLoading = true) => {
    try {
      if (showLoading) setStats(prev => ({ ...prev, loading: true }));
      
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
        <p className="text-muted-foreground text-lg max-w-2xl">Visualização consolidada de toda a infraestrutura multi-tenant e performance global.</p>
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
            <Card className="bg-luxury-dark-lighter/40 border-white/5 hover:border-accent/30 transition-all group overflow-hidden relative">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stats.loading ? (
                    <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
                  ) : (
                    <span className="text-3xl font-serif font-bold text-card">{stat.value}</span>
                  )}
                </div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground/60">{stat.label}</h3>
                
                {/* Background Accent */}
                <div className={`absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity`}>
                   <stat.icon className="w-24 h-24" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Atalhos Rápidos e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-serif font-bold text-accent flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Integridade do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-card">Banco de Dados</h4>
                  <p className="text-xs text-muted-foreground">Conexão estável e latência otimizada.</p>
                </div>
             </div>
             <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-card">Serviços de Auth</h4>
                  <p className="text-xs text-muted-foreground">Provedores de identidade operacionais.</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="bg-accent/5 border border-accent/20 rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-serif font-bold text-accent">Configurações Rápidas</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está operando como Administrador Global. Todas as alterações nesta área impactam múltiplos sites simultaneamente.
            </p>
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Versão da Rede</span>
                <span className="text-accent font-bold">v2.4.0-gold</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Último Backup</span>
                <span className="text-accent font-bold">Há 12 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
