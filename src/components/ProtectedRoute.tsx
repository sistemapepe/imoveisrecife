import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Quando o loading do AuthContext termina, damos um pequeno delay para garantir que o estado do role estabilizou
    if (!loading) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não houver usuário ou o papel for 'user' (sem permissões administrativas), redireciona para login
  // IMPORTANTE: Permitimos o acesso se o role ainda for null mas o user existir, 
  // pois o AuthContext garante que o loading=true enquanto busca o role.
  if (!user || (role === "user")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
