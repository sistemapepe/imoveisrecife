import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isInitializing, role } = useAuth();
  const location = useLocation();
  const isNetworkPath = location.pathname.startsWith('/network-admin');

  // No Network Admin, se já tivermos o role de super_admin no estado, ignoramos o loading de auth/site
  const isBypassLoading = isNetworkPath && role === "super_admin";

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

  // Se não houver usuário ou o papel for 'user' (sem permissões administrativas), redireciona para login
  if (!user || role === "user") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se for acesso à rede, exige explicitamente super_admin
  if (isNetworkPath && role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
