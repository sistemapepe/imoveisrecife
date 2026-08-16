import { ReactNode, useMemo } from "react";
import { motion, useReducedMotion, Transition } from "framer-motion";

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 10
  },
  animate: { 
    opacity: 1, 
    y: 0
  },
  exit: { 
    opacity: 0, 
    y: -10
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const shouldReduceMotion = useReducedMotion();
  
  // Detect low-end devices or slow connections
  const isSlowDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    const connection = (navigator as any).connection;
    const memory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency;
    
    return (
      (connection && /2g|3g/.test(connection.effectiveType)) ||
      (memory && memory <= 4) ||
      (hardwareConcurrency && hardwareConcurrency <= 4)
    );
  }, []);

  const variants = (shouldReduceMotion || isSlowDevice) ? reducedVariants : pageVariants;
  const transition: Transition = (shouldReduceMotion || isSlowDevice) 
    ? { duration: 0.2 } 
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;