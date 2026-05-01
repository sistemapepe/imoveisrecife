import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedImageUrl, IMAGE_SIZES, getImageSrcSet, isSupabaseUrl } from "@/lib/image-optimization";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ImageLightbox({ images, initialIndex, isOpen, onClose, title }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchDelta = useRef(0);
  
  // Pinch-to-zoom refs
  const initialPinchDistance = useRef(0);
  const initialPinchScale = useRef(1);
  const isPinching = useRef(false);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goTo = useCallback((dir: number) => {
    resetZoom();
    setCurrentIndex((prev) => (prev + dir + images.length) % images.length);
  }, [images.length, resetZoom]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetZoom();
  }, [initialIndex, isOpen, resetZoom]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, goTo]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);
  
  // Pre-load next and previous images for smooth navigation
  useEffect(() => {
    if (!isOpen || images.length <= 1) return;

    const preloadImage = (index: number) => {
      const url = images[index];
      if (!url) return;

      // Pre-load the optimized versions
      // Using 1200 as a good balance for lightbox preloading
      const img1200 = new Image();
      img1200.src = getOptimizedImageUrl(url, { width: 1200, quality: 80 });
      
      const img800 = new Image();
      img800.src = getOptimizedImageUrl(url, { width: 800, quality: 80 });
    };

    // Preload next image
    preloadImage((currentIndex + 1) % images.length);
    // Preload previous image
    preloadImage((currentIndex - 1 + images.length) % images.length);
    
    // Also preload the next 2 images ahead if we have many
    if (images.length > 3) {
      preloadImage((currentIndex + 2) % images.length);
    }
  }, [currentIndex, isOpen, images]);

  const toggleZoom = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: posStart.current.x + (e.clientX - dragStart.current.x),
      y: posStart.current.y + (e.clientY - dragStart.current.y),
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      isPinching.current = true;
      initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
      initialPinchScale.current = scale;
      return;
    }
    if (scale > 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching.current) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.min(5, Math.max(1, initialPinchScale.current * (dist / initialPinchDistance.current)));
      setScale(newScale);
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return;
    }
    if (scale > 1 && e.touches.length === 1) {
      // Pan while zoomed
      if (!isDragging) {
        setIsDragging(true);
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        posStart.current = { ...position };
      } else {
        setPosition({
          x: posStart.current.x + (e.touches[0].clientX - dragStart.current.x),
          y: posStart.current.y + (e.touches[0].clientY - dragStart.current.y),
        });
      }
      return;
    }
    if (scale > 1) return;
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPinching.current && e.touches.length < 2) {
      isPinching.current = false;
      setIsDragging(false);
      if (scale <= 1.05) resetZoom();
      return;
    }
    setIsDragging(false);
    if (scale > 1 || images.length <= 1) return;
    if (touchDelta.current > 60) goTo(-1);
    else if (touchDelta.current < -60) goTo(1);
    touchDelta.current = 0;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white/80">
          <span className="text-sm font-medium">{currentIndex + 1} / {images.length}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setScale((s) => Math.max(1, s - 0.5))} aria-label="Diminuir zoom" className="p-2 rounded-full hover:bg-white/10 transition">
              <ZoomOut className="h-5 w-5" aria-hidden="true" />
            </button>
            <button onClick={() => setScale((s) => Math.min(5, s + 0.5))} aria-label="Aumentar zoom" className="p-2 rounded-full hover:bg-white/10 transition">
              <ZoomIn className="h-5 w-5" aria-hidden="true" />
            </button>
            <button onClick={onClose} aria-label="Fechar galeria" className="p-2 rounded-full hover:bg-white/10 transition">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Main image */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden relative select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 1 && (
            <>
              <button
                onClick={() => goTo(-1)}
                className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition hidden md:flex"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => goTo(1)}
                className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition hidden md:flex"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            src={getOptimizedImageUrl(images[currentIndex], IMAGE_SIZES.FULL)}
            srcSet={getImageSrcSet(images[currentIndex], [800, 1200, 1920])}
            sizes="100vw"
            alt={`${title || "Foto"} ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain cursor-grab active:cursor-grabbing"
            loading="eager"
            decoding="async"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging || isPinching.current ? "none" : "transform 0.2s ease",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={toggleZoom}
            draggable={false}
          />
        </div>

        {/* Zoom indicator */}
        {scale > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-xs font-medium">
            {Math.round(scale * 100)}%
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto justify-center scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { resetZoom(); setCurrentIndex(i); }}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex ? "border-primary opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                }`}
              >
                <img 
                  src={getOptimizedImageUrl(img, IMAGE_SIZES.THUMBNAIL)} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}