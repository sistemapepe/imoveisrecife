import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import React from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isInitializing, role } = useAuth();
  const location = useLocation();
  const isNetworkPath = location.pathname.startsWith('/network-admin');

  const isAdminPath = location.pathname.startsWith('/admin');
  const isBypassLoading = (isNetworkPath || isAdminPath) && role === "super_admin";

  if ((isInitializing || loading) && !isBypassLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-luxury-dark text-accent">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <div>
            <p className="text-xs text-accent/60 animate-pulse mb-1">Verificando credenciais...</p>
            <p className="text-[10px] text-accent/40 max-w-[200px]">
              {isNetworkPath ? "Autenticando acesso global à rede..." : "Se você ficar preso aqui por mais de 5 segundos, tente recarregar."}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="text-[10px] font-bold text-accent hover:underline"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || role === "user") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isNetworkPath && role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};
export default ProtectedRoute;