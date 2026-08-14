import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isInitializing, role } = useAuth();
  const location = useLocation();

  if (isInitializing || (loading && !user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground animate-pulse">Verificando credenciais...</p>
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
