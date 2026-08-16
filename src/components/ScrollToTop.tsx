import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import React from "react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed left-6 bottom-24 z-40 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white/70 p-2 rounded-lg transition-all"
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};
export default ScrollToTop;
