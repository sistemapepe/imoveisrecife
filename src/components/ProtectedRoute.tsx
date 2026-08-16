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
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || role === "user" || !role) {
        setShouldRedirect(true);
      }
    }
  }, [loading, user, role]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || role === "user" || !role) {
     return null; // Evita renderizar enquanto o useEffect processa o redirecionamento
  }

  return <>{children}</>;
}
