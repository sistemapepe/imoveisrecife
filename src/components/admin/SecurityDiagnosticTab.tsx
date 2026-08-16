import { useAuth } from "@/contexts/AuthContext";
import { Shield, Lock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSite } from "@/contexts/SiteContext";

export default function SecurityDiagnosticTab() {
  const { user, role, isAdmin, isSuperAdmin, ...perms } = useAuth();
  const { site } = useSite();

  const permissionList = [
    { key: "view_properties", label: "Ver Imóveis" },
    { key: "manage_properties", label: "Gerenciar Imóveis" },
    { key: "delete_properties", label: "Excluir Imóveis" },
    { key: "view_contacts", label: "Ver Contatos/Leads" },
    { key: "manage_settings", label: "Gerenciar Configurações" },
    { key: "manage_users", label: "Gerenciar Usuários" },
    { key: "view_analytics", label: "Ver Analytics" },
    { key: "view_visits", label: "Ver Visitas" },
    { key: "view_traffic", label: "Ver Tráfego" },
    { key: "manage_seo", label: "Gerenciar SEO" },
    { key: "bulk_import", label: "Importação em Massa" },
    { key: "manage_privacy", label: "Gerenciar Privacidade" },
    { key: "manage_bucket", label: "Gerenciar Storage" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-accent">Diagnóstico de Segurança</h2>
          <p className="text-muted-foreground">Verifique suas permissões e contexto atual de acesso.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-black/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" /> Identidade & Função
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold">E-mail Logado</label>
              <p className="text-sm font-medium text-accent">{user?.email || "Não identificado"}</p>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold">ID do Usuário</label>
              <p className="text-[10px] font-mono break-all">{user?.id}</p>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold">Função (Role)</label>
              <div className="mt-1">
                <span className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-bold uppercase">
                  {role || "Nenhuma"}
                </span>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2">
                {isAdmin ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span className="text-xs">Admin</span>
              </div>
              <div className="flex items-center gap-2">
                {isSuperAdmin ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span className="text-xs">Super Admin</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" /> Contexto do Site (Tenant)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold">Domínio Atual</label>
              <p className="text-sm font-medium text-accent">{window.location.hostname}</p>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase font-bold">ID da Instância (site_id)</label>
              <p className="text-[10px] font-mono break-all text-accent">{site?.id || "Global/Desconhecido"}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-[10px] text-yellow-200/80 leading-relaxed">
                As permissões são filtradas pelo <strong>site_id</strong>. Se você é Admin no Site A, não terá acesso ao Site B a menos que explicitamente convidado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Mapa de Permissões Granulares</CardTitle>
          <CardDescription>Status atual de cada capacidade no sistema para sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {permissionList.map((p) => {
              const hasPerm = (perms as any)[`can${p.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`];
              return (
                <div key={p.key} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-xs font-medium text-accent">{p.label}</span>
                  {hasPerm ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
