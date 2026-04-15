import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetZoom();
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, currentIndex]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const goTo = useCallback((dir: number) => {
    resetZoom();
    setCurrentIndex((prev) => (prev + dir + images.length) % images.length);
  }, [images.length]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (scale > 1) return;
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
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
            <button onClick={() => setScale((s) => Math.max(1, s - 0.5))} className="p-2 rounded-full hover:bg-white/10 transition">
              <ZoomOut className="h-5 w-5" />
            </button>
            <button onClick={() => setScale((s) => Math.min(5, s + 0.5))} className="p-2 rounded-full hover:bg-white/10 transition">
              <ZoomIn className="h-5 w-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main image */}
        <div
          className="flex-1 flex items-center justify-center overflow-hidden relative select-none"
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
            src={images[currentIndex]}
            alt={`${title || "Foto"} ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? "none" : "transform 0.2s ease",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={toggleZoom}
            draggable={false}
          />
        </div>

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
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
