import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Palette, ShieldAlert, Loader2, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function NetworkSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    // Tenta carregar do cache imediatamente para evitar tela de loading
    const cached = sessionStorage.getItem("network_settings_data");
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        if (data) {
          setSettings(data);
          setLoading(false);
        }
      } catch (e) {}
    }
    fetchSettings(false); // Background fetch
  }, []);

  const fetchSettings = async (forceLoading = false) => {
    try {
      if (forceLoading) setLoading(true);
      
      const { data, error } = await supabase
        .from("network_settings")
        .select("*");
      
      if (error) throw error;
      
      setSettings(data || []);
      sessionStorage.setItem("network_settings_data", JSON.stringify({ 
        data: data || [], 
        timestamp: Date.now() 
      }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = (key: string, value: any) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      for (const setting of settings) {
        const { error } = await supabase
          .from("network_settings")
          .update({ value: setting.value })
          .eq("key", setting.key);
        
        if (error) throw error;
      }

      sessionStorage.removeItem("network_settings_data");
      toast({
        title: "Configurações salvas",
        description: "As alterações globais foram aplicadas com sucesso.",
      });
      fetchSettings(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-muted-foreground animate-pulse font-serif italic">Carregando configurações globais...</p>
      </div>
    );
  }

  const themeDefaults = settings.find(s => s.key === 'theme_defaults')?.value || {};
  const resourceLimits = settings.find(s => s.key === 'resource_limits')?.value || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-accent">Configurações de Rede</h2>
          <p className="text-accent/70">Gerencie temas globais e limites de recursos para toda a rede.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => fetchSettings(true)} 
            className="border-white/10 hover:bg-white/5"
            disabled={saving}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
          <Button 
            onClick={saveSettings} 
            className="bg-accent text-luxury-dark hover:bg-accent/90 font-bold"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Temas Globais */}
        <Card className="bg-luxury-dark-lighter/40 border-white/5 shadow-2xl overflow-hidden group">
          <CardHeader className="border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-accent font-serif">Temas Padrão</CardTitle>
                <CardDescription>Configurações visuais padrão para novos sites.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-accent/60">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={themeDefaults.primary} 
                    onChange={(e) => handleUpdateSetting('theme_defaults', { ...themeDefaults, primary: e.target.value })}
                    className="w-12 h-10 p-1 bg-black/40 border-white/10"
                  />
                  <Input 
                    type="text" 
                    value={themeDefaults.primary} 
                    onChange={(e) => handleUpdateSetting('theme_defaults', { ...themeDefaults, primary: e.target.value })}
                    className="bg-black/40 border-white/10 font-mono text-accent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-accent/60">Cor de Destaque (Accent/Gold)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={themeDefaults.accent || "#b89b5e"} 
                    onChange={(e) => handleUpdateSetting('theme_defaults', { ...themeDefaults, accent: e.target.value })}
                    className="w-12 h-10 p-1 bg-black/40 border-white/10"
                  />
                  <Input 
                    type="text" 
                    value={themeDefaults.accent || "#b89b5e"} 
                    onChange={(e) => handleUpdateSetting('theme_defaults', { ...themeDefaults, accent: e.target.value })}
                    className="bg-black/40 border-white/10 font-mono text-accent"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl italic text-xs text-accent/80">
              Dica: Essas cores serão aplicadas automaticamente como base para qualquer novo site criado via duplicação ou criação manual.
            </div>
          </CardContent>
        </Card>

        {/* Limites de Recursos */}
        <Card className="bg-luxury-dark-lighter/40 border-white/5 shadow-2xl overflow-hidden group">
          <CardHeader className="border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-red-400 font-serif">Limites de Recursos</CardTitle>
                <CardDescription>Restrições globais para instâncias individuais.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-accent/60">Máximo de Imóveis por Site</Label>
                <Input 
                  type="number" 
                  value={resourceLimits.max_properties_per_site} 
                  onChange={(e) => handleUpdateSetting('resource_limits', { ...resourceLimits, max_properties_per_site: parseInt(e.target.value) })}
                  className="bg-black/40 border-white/10 text-accent"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-accent/60">Máximo de Usuários por Site</Label>
                <Input 
                  type="number" 
                  value={resourceLimits.max_users_per_site} 
                  onChange={(e) => handleUpdateSetting('resource_limits', { ...resourceLimits, max_users_per_site: parseInt(e.target.value) })}
                  className="bg-black/40 border-white/10 text-accent"
                />
              </div>
            </div>
            
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl italic text-xs text-red-400/80">
              Atenção: Aumentar esses limites pode impactar os custos de infraestrutura global da rede.
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
