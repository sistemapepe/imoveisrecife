import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const PERMISSIONS = [
  { key: "view_properties", label: "Visualizar Imóveis" },
  { key: "manage_properties", label: "Criar/Editar Imóveis" },
  { key: "delete_properties", label: "Excluir Imóveis" },
  { key: "bulk_import", label: "Importar em Massa (Excel)" },
  { key: "view_contacts", label: "Visualizar Contatos" },
  { key: "view_visits", label: "Visualizar Visitas" },
  { key: "view_analytics", label: "Visualizar Analytics" },
  { key: "view_traffic", label: "Visualizar Tráfego" },
  { key: "manage_seo", label: "SEO Audit" },
  { key: "manage_settings", label: "Configurações do Site" },
  { key: "manage_bucket", label: "Acesso a Imagens (Bucket)" },
  { key: "manage_privacy", label: "Gerenciar LGPD" },
  { key: "manage_users", label: "Gestão de Equipe" },
];

const CONFIGURABLE_ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "supervisor", label: "Supervisor" },
  { value: "corretor", label: "Corretor" },
];

interface PermRow {
  role: string;
  permission: string;
  enabled: boolean;
}

export default function PermissionsConfig() {
  const [perms, setPerms] = useState<PermRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPerms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("role_permissions")
      .select("role, permission, enabled");
    if (error) {
      toast.error("Erro ao carregar permissões");
    } else {
      setPerms(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPerms();
  }, [fetchPerms]);

  const getEnabled = (role: string, permission: string) => {
    const row = perms.find((p) => p.role === role && p.permission === permission);
    return row?.enabled ?? false;
  };

  const toggle = (role: string, permission: string) => {
    setPerms((prev) => {
      const existing = prev.find((p) => p.role === role && p.permission === permission);
      if (existing) {
        return prev.map((p) =>
          p.role === role && p.permission === permission
            ? { ...p, enabled: !p.enabled }
            : p
        );
      }
      return [...prev, { role, permission, enabled: true }];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Incluir super_admin para garantir que ele tenha tudo habilitado no banco
      const rolesToSave = [
        { value: "super_admin", label: "Super Admin" },
        ...CONFIGURABLE_ROLES
      ];

      const rows = rolesToSave.flatMap((role) =>
        PERMISSIONS.map((perm) => ({
          role: role.value,
          permission: perm.key,
          enabled: role.value === "super_admin" ? true : getEnabled(role.value, perm.key),
        }))
      );

      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { 
          action: "update_perms", 
          perms: rows 
        },
      });
      
      if (error || data?.error) throw error || new Error(data?.error);
      
      toast.success("Permissões salvas!");
    } catch (err) {
      console.error("Erro ao salvar permissões:", err);
      toast.error("Erro ao salvar permissões");
    }
    setSaving(false);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Carregando permissões...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-base font-bold">Permissões por Função</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Administradores sempre têm acesso total. Configure abaixo o que cada função pode acessar.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Permissão
              </th>
              {CONFIGURABLE_ROLES.map((r) => (
                <th key={r.value} className="text-center py-3 px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm) => (
              <tr key={perm.key} className="border-b border-border/50">
                <td className="py-3 pr-4 text-sm font-medium">{perm.label}</td>
                {CONFIGURABLE_ROLES.map((r) => (
                  <td key={r.value} className="text-center py-3 px-3">
                    <button
                      onClick={() => toggle(r.value, perm.key)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        getEnabled(r.value, perm.key)
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${
                          getEnabled(r.value, perm.key) ? "translate-x-4 left-0.5" : "left-0.5 translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Salvando..." : "Salvar Permissões"}
      </Button>
    </div>
  );
}
