import { useState } from "react";
import { Play, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VirtualTourProps {
  videoUrl: string;
  title: string;
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  
  // Matterport
  const mpMatch = url.match(/matterport\.com\/show\/\?m=([a-zA-Z0-9]+)/);
  if (mpMatch) return `https://my.matterport.com/show/?m=${mpMatch[1]}&play=1`;

  // Generic iframe
  return url;
}

export default function VirtualTour({ videoUrl, title }: VirtualTourProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!videoUrl) return null;

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Play className="h-5 w-5 text-accent" /> Tour Virtual 360°
        </h2>
        <div className="relative rounded-2xl overflow-hidden bg-card border border-border aspect-video">
          <iframe
            src={embedUrl}
            title={`Tour virtual - ${title}`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 p-2 rounded-full bg-foreground/60 backdrop-blur-sm text-card hover:bg-foreground/80 transition"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <span className="text-sm font-medium">Tour Virtual — {title}</span>
              <button onClick={() => setIsFullscreen(false)} className="p-2 rounded-full hover:bg-white/10 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              src={embedUrl}
              title={`Tour virtual fullscreen - ${title}`}
              className="flex-1 w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
