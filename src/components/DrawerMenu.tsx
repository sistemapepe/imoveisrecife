import { X, LayoutDashboard, LogOut, Settings, Users, Bell, MessageSquare, BarChart3, Footprints, ShieldCheck, Home, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();
  const { settings } = useProperties();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuItems: any[] = [];

  const adminItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin?tab=dashboard", roles: ["admin", "supervisor", "corretor"] },
    { label: "Visualizar Site", icon: Globe, path: "/", roles: ["admin", "supervisor", "corretor"] },
    { label: "Propriedades", icon: Home, path: "/admin?tab=properties", roles: ["admin", "supervisor", "corretor"] },
    { label: "Analytics", icon: BarChart3, path: "/admin?tab=analytics", roles: ["admin", "supervisor"] },
    { label: "Configurações", icon: Settings, path: "/admin?tab=settings", roles: ["admin"] },
    { label: "Usuários", icon: Users, path: "/admin?tab=users", roles: ["admin"] },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-card shadow-2xl flex flex-col border-r border-border"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-border">
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl text-accent uppercase tracking-[0.2em]">
                  Painel
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Administrativo</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-4 space-y-1">
                {user && role !== "user" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-1"
                  >
                    {adminItems.filter(item => !item.roles || (role && item.roles.includes(role))).map((item, index) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-accent/5 text-foreground/70 hover:text-accent transition-all duration-300 group"
                      >
                        <item.icon className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </nav>
            </div>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 border-t border-border bg-muted/30"
            >
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-foreground line-clamp-1 truncate">{user.email}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all font-medium text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-lg hover:shadow-accent/20 transition-all active:scale-95"
                  >
                    Acessar Admin
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
