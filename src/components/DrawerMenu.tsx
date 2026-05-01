import { X, LayoutDashboard, LogOut, Settings, Users, BarChart3, Home, Globe, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const navigate = useNavigate();
  const { user, signOut, role } = useAuth();

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
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-white flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <span className="font-sans font-black text-[18px] text-black uppercase tracking-[0.1em]">
                GESTÃO DO SITE
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto mt-4">
              <nav className="px-8">
                {user && role !== "user" && (
                  <div className="flex flex-col">
                    {adminItems.filter(item => !item.roles || (role && item.roles.includes(role))).map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full flex items-center py-5 border-b border-gray-100 text-gray-900 hover:text-black transition-all group"
                      >
                        <span className="font-bold text-[14px] uppercase tracking-[0.15em]">{item.label}</span>
                      </button>
                    ))}
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center py-5 border-b border-gray-100 text-gray-900 hover:text-red-600 transition-all group"
                    >
                      <span className="font-bold text-[14px] uppercase tracking-[0.15em]">Sair</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>

            {/* Minimal Footer Removed to match layout */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
