import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  variant?: "floating" | "ghost";
  className?: string;
  onClick?: () => void;
  label?: string;
}

export default function BackButton({ variant = "floating", className = "", onClick, label = "Voltar" }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Pages that already have a header back button - don't show the floating one
  const pagesWithHeaderBack = ["/busca", "/favoritos", "/admin", "/filtros", "/login", "/privacidade"];
  if (variant === "floating" && (location.pathname === "/" || pagesWithHeaderBack.includes(location.pathname))) return null;

  const handleBack = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (variant === "ghost") {
    return (
      <button
        onClick={handleBack}
        className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors -ml-1 ${className}`}
        aria-label={label}
      >
        <ArrowLeft className="h-6 w-6 text-foreground" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={`fixed top-24 left-6 z-[60] h-11 w-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-white transition-all active:scale-90 md:left-10 ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-6 w-6" />
    </button>
  );
}
