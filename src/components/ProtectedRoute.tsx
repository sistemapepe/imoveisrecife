import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isInitializing, role } = useAuth();
  const location = useLocation();

  if (isInitializing || (loading && !user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <p className="text-xs text-muted-foreground animate-pulse mb-1">Verificando credenciais...</p>
            <p className="text-[10px] text-muted-foreground/60 max-w-[200px]">
              Se você ficar preso aqui por mais de 10 segundos, tente recarregar ou fazer login novamente.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Recarregar página
            </button>
            <button 
              onClick={() => window.location.href = "/login"}
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground hover:underline"
            >
              Ir para login
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

  return <>{children}</>;
}
