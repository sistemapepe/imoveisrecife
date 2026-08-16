import { useProperties } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

export default function MarqueeBanner() {
  const { properties, settings } = useProperties();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const customText = settings.marqueeText?.split('|').map(t => t.trim()).filter(Boolean);
  const items = customText && customText.length > 0 ? customText : properties.map(p => p.title);

  if (items.length === 0) return null;

  // Duplicating the list only if motion is enabled to avoid cluttering DOM unnecessarily if static
  const marqueeItems = shouldReduceMotion ? items : [...items, ...items, ...items];

  return (
    <div 
      style={{ paddingTop: `var(--marquee-py, 6px)`, paddingBottom: `var(--marquee-py, 6px)` }}
      className="w-full bg-accent/5 backdrop-blur-sm border-b border-white/5 overflow-hidden select-none"
      role="region"
      aria-label="Banner de propriedades em destaque"
    >
      <motion.div
        className={`flex ${shouldReduceMotion ? 'flex-wrap justify-center gap-x-4 gap-y-2 px-4' : 'whitespace-nowrap gap-12'}`}
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
        {marqueeItems.map((item, index) => {
          const property = properties.find(p => p.title === item);
          const isLink = !!property;
          
          return (
            <button
              key={`${item}-${index}`}
              onClick={() => isLink ? navigate(`/imovel/${property.id}`) : null}
              className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-accent/80 hover:text-accent focus-visible:text-accent transition-all flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded px-2 py-1 ${!isLink ? 'cursor-default pointer-events-none' : ''}`}
              aria-label={isLink ? `Ver detalhes de ${item}` : item}
            >
              <span className="w-2 h-2 rounded-full bg-primary/60" />
              {item}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
