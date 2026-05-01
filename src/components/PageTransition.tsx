import { ReactNode } from "react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { 
    opacity: 0, 
  },
  animate: { 
    opacity: 1, 
  },
  exit: { 
    opacity: 0, 
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
