import { useProperties } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

export default function MarqueeBanner() {
  const { properties } = useProperties();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  if (properties.length === 0) return null;

  // Duplicating the list only if motion is enabled to avoid cluttering DOM unnecessarily if static
  const marqueeProperties = shouldReduceMotion ? properties : [...properties, ...properties, ...properties];

  return (
    <div 
      className="w-full bg-accent/20 border-b border-accent/30 overflow-hidden py-3 select-none"
      role="region"
      aria-label="Banner de propriedades em destaque"
    >
      <motion.div
        className={`flex ${shouldReduceMotion ? 'flex-wrap justify-center gap-6' : 'whitespace-nowrap gap-12'}`}
        animate={shouldReduceMotion ? {} : {
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 45,
            ease: "linear",
          },
        }}
        whileHover={{ animationPlayState: "paused" }}
        whileFocus={{ animationPlayState: "paused" }}
      >
        {marqueeProperties.map((property, index) => (
          <button
            key={`${property.id}-${index}`}
            onClick={() => navigate(`/imovel/${property.id}`)}
            className="text-[11px] md:text-sm font-bold uppercase tracking-[0.15em] text-accent-foreground hover:text-primary focus-visible:text-primary transition-all flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-2 py-1"
            aria-label={`Ver detalhes de ${property.title}`}
          >
            <span className="w-2 h-2 rounded-full bg-primary/60" />
            {property.title}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
