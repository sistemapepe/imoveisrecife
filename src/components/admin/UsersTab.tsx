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
  { value: "super_admin", label: "Super Admin", color: "bg-red-500/10 text-red-500" },
  { value: "admin", label: "Administrador", color: "bg-orange-500/10 text-orange-500" },
  { value: "supervisor", label: "Supervisor", color: "bg-blue-500/10 text-blue-500" },
  { value: "corretor", label: "Corretor", color: "bg-accent/10 text-accent" },
];

function roleBadge(role: string) {
  const r = ROLES.find((x) => x.value === role);
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-[0.2em] border border-white/5 ${r?.color || "bg-muted text-muted-foreground"}`}>
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
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        setUsers(data);
        
        // TTL de 5 minutos para cache global, 1 minuto para site específico
        const ttl = isNetwork ? 300000 : 60000;
        if (Date.now() - timestamp < ttl) {
          setLoading(false);
          // Atualiza em background sem mostrar loading
          fetchUsersInternal(cacheKey, false);
          return;
        }
      } catch (e) {}
    }

    if (showLoading) setLoading(true);
    fetchUsersInternal(cacheKey, true);
  }, [site?.id, isNetwork]);

  const fetchUsersInternal = async (cacheKey: string, updateLoadingState: boolean) => {
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
    if (updateLoadingState) setLoading(false);
  };

  useEffect(() => { fetchUsers(true); }, [fetchUsers]);

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
        <h2 className="font-serif font-bold text-2xl text-accent tracking-[0.2em] uppercase">Usuários</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-luxury-dark text-[10px] font-extrabold uppercase tracking-widest hover:bg-accent/80 transition-all shadow-lg shadow-accent/20"
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
            <div key={u.id} className="bg-[#0d1419] rounded-[2rem] border border-white/5 p-6 flex items-center gap-4 hover:border-accent/30 transition-all duration-500 premium-shadow group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-accent/20 transition-colors">
                <Shield className="h-5 w-5 text-accent/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white tracking-wide truncate group-hover:text-accent transition-colors">{u.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {roleBadge(u.role)}
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/20">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl border border-white/5 bg-white/5 text-white/70 focus:outline-none focus:border-accent/40"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                onClick={() => setDeleteId(u.id)}
                className="p-3 rounded-xl bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/10"
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
