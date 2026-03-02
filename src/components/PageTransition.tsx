import { ReactNode } from "react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
    filter: "blur(4px)",
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: { 
    opacity: 0, 
    y: -15,
    scale: 0.99,
    filter: "blur(2px)",
  },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
