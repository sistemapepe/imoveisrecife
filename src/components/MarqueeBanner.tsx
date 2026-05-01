import { useProperties } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MarqueeBanner() {
  const { properties } = useProperties();
  const navigate = useNavigate();

  if (properties.length === 0) return null;

  // Duplicating the list to ensure a smooth continuous loop
  const marqueeProperties = [...properties, ...properties, ...properties];

    <div 
      className="w-full bg-accent/10 border-b border-accent/20 overflow-hidden py-2 select-none"
      role="region"
      aria-label="Banner de propriedades em destaque"
    >
      <motion.div
        className="flex whitespace-nowrap gap-12"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
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
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-accent hover:text-primary transition-all flex items-center gap-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-1"
            aria-label={`Ver detalhes de ${property.title}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {property.title}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
