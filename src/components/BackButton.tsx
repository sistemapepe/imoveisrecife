import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on home page
  if (location.pathname === "/") return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="fixed top-24 left-6 z-[60] h-11 w-11 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:bg-white transition-all active:scale-90 md:left-10"
      aria-label="Voltar"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
