import { useCallback, useRef } from 'react';

export function useMobileInteractions() {
  const lastTapRef = useRef<number>(0);

  const handleTap = useCallback((callback: () => void) => {
    return (e: React.MouseEvent | React.TouchEvent) => {
      // Prevent phantom clicks / double taps on mobile
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        e.preventDefault();
        return;
      }
      lastTapRef.current = now;
      callback();
    };
  }, []);

  return { handleTap };
}
