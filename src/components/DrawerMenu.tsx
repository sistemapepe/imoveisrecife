import { X, LayoutDashboard, LogOut, Settings, Users, Bell, MessageSquare, BarChart3, Footprints, ShieldCheck, Home, Globe, User } from "lucide-react";
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
    { label: "DASHBOARD", icon: LayoutDashboard, path: "/admin?tab=dashboard", roles: ["admin", "supervisor", "corretor"] },
    { label: "SITE", icon: Globe, path: "/", roles: ["admin", "supervisor", "corretor"] },
    { label: "PROPRIEDADES", icon: Home, path: "/admin?tab=properties", roles: ["admin", "supervisor", "corretor"] },
    { label: "ANALYTICS", icon: BarChart3, path: "/admin?tab=analytics", roles: ["admin", "supervisor", "corretor"] },
    { label: "USUÁRIOS", icon: Users, path: "/admin?tab=users", roles: ["admin"] },
    { label: "CONFIGURAÇÕES", icon: Settings, path: "/admin?tab=settings", roles: ["admin"] },
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
            className="fixed top-0 left-0 bottom-0 z-[70] w-[300px] bg-white flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl text-black uppercase tracking-[0.1em] leading-none">
                  Gestão do Site
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium mt-1">Menu Administrativo</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pt-4">
              <nav className="px-4">
                {user && role !== "user" && (
                  <div className="flex flex-col gap-2">
                    {adminItems.filter(item => !item.roles || (role && item.roles.includes(role))).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full flex items-center gap-4 py-4 border-b border-gray-50 text-gray-800 hover:text-black transition-all group"
                      >
                        <item.icon className="h-5 w-5 text-gray-500 group-hover:text-black" strokeWidth={1.5} />
                        <span className="font-bold text-[13px] uppercase tracking-[0.1em]">{item.label}</span>
                      </button>
                    ))}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-4 py-4 border-b border-gray-50 text-gray-800 hover:text-red-600 transition-all group"
                    >
                      <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-600" strokeWidth={1.5} />
                      <span className="font-bold text-[13px] uppercase tracking-[0.1em]">Sair</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 border-t border-gray-100 bg-gray-50/50"
            >
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[12px] font-bold text-black truncate tracking-tight">{user.email?.split('@')[0].toUpperCase()}</span>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">{role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold text-[10px] uppercase tracking-[0.1em]"
                  >
                    <LogOut className="h-4 w-4" />
                    Encerrar Sessão
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full py-3 rounded-lg bg-black text-white font-bold text-xs tracking-widest uppercase hover:bg-gray-900 transition-all active:scale-[0.98]"
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
