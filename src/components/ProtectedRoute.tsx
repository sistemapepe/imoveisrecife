import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm">Verificando acesso...</p>
      </div>
    );
  }

  // Se não houver usuário ou o papel for 'user' (sem permissões administrativas), redireciona para login
  if (!user || role === "user" || !role) {
    console.log("ProtectedRoute: Unauthorized, redirecting", { hasUser: !!user, role });
    // Usar uma URL absoluta para evitar que o Navigate entre em loop se estivermos em uma rota aninhada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
