import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSite } from "@/contexts/SiteContext";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PermissionsConfig from "./PermissionsConfig";

interface ManagedUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const ROLES = [
  { value: "super_admin", label: "Super Admin", color: "bg-red-500/10 text-red-600" },
  { value: "admin", label: "Administrador", color: "bg-destructive/10 text-destructive" },
  { value: "supervisor", label: "Supervisor", color: "bg-primary/10 text-primary" },
  { value: "corretor", label: "Corretor", color: "bg-accent/20 text-accent-foreground" },
];

function roleBadge(role: string) {
  const r = ROLES.find((x) => x.value === role);
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${r?.color || "bg-muted text-muted-foreground"}`}>
      {r?.label || role}
    </span>
  );
}

export default function UsersTab({ isNetwork = false }: { isNetwork?: boolean }) {
  const { site } = useSite();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("corretor");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async (showLoading = true) => {
    if (!site && !isNetwork) return;
    
    const cacheKey = `users_list_${isNetwork ? 'global' : site?.id}`;
    if (showLoading) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // Aumentado cache para 5 minutos se for rede global para evitar hits na Edge Function
          const ttl = isNetwork ? 300000 : 60000;
          if (Date.now() - timestamp < ttl) {
            setUsers(data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }
      setLoading(true);
    }

    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "list", siteId: isNetwork ? null : site?.id },
    });

    if (error || data?.error) {
      toast.error(data?.error || "Erro ao carregar usuários");
    } else {
      const usersList = data.users || [];
      setUsers(usersList);
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: usersList, timestamp: Date.now() }));
    }
    setLoading(false);
  }, [site?.id, isNetwork]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    if (!newEmail || !newPassword) { toast.error("Preencha e-mail e senha"); return; }
    if (newPassword.length < 6) { toast.error("Senha mínima: 6 caracteres"); return; }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "create", email: newEmail, password: newPassword, role: newRole, siteId: isNetwork ? null : site?.id },
    });
    setCreating(false);
    if (error || data?.error) {
      toast.error(data?.error || "Erro ao criar usuário");
    } else {
      toast.success("Usuário criado!");
      setShowCreate(false);
      setNewEmail("");
      setNewPassword("");
      setNewRole("corretor");
      fetchUsers();
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "update_role", userId, role },
    });
    if (error || data?.error) {
      toast.error(data?.error || "Erro ao atualizar");
    } else {
      toast.success("Função atualizada!");
      fetchUsers();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { data, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "delete", userId: deleteId },
    });
    if (error || data?.error) {
      toast.error(data?.error || "Erro ao remover");
    } else {
      toast.success("Usuário removido!");
      fetchUsers();
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Usuários</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
        >
          <UserPlus className="h-4 w-4" /> Novo
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum usuário encontrado</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {roleBadge(u.role)}
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                className="text-xs px-2 py-1.5 rounded-lg border border-border bg-background"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                onClick={() => setDeleteId(u.id)}
                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>O usuário receberá acesso ao sistema com a função selecionada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">E-mail</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Função</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Permissions Config - Hidden in Network Admin as it is site-specific */}
      {!isNetwork && (
        <div className="mt-8 pt-6 border-t border-border">
          <PermissionsConfig />
        </div>
      )}
    </div>
  );
}
