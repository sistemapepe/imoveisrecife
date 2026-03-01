import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Timeout safety - if compression takes too long, use original file
    const timeout = setTimeout(() => {
      console.warn("Image compression timed out, using original file");
      resolve(file);
    }, 10000);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          resolve(file); // fallback to original
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        const tryFormat = (format: string, q: number) => {
          canvas.toBlob(
            (blob) => {
              clearTimeout(timeout);
              URL.revokeObjectURL(objectUrl);
              resolve(blob || file);
            },
            format,
            q
          );
        };

        if (typeof canvas.toBlob === "function") {
          tryFormat("image/webp", quality);
        } else {
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        }
      } catch {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback to original instead of rejecting
    };

    img.src = objectUrl;
  });
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...images];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      setProgress(`${i + 1}/${total}`);

      try {
        const compressed = await compressImage(file);
        const isOriginal = compressed === file;
        const ext = isOriginal ? (file.name.split(".").pop() || "jpg") : "webp";
        const contentType = isOriginal ? file.type || "image/jpeg" : "image/webp";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `properties/${fileName}`;

        const { error } = await supabase.storage
          .from("property-images")
          .upload(filePath, compressed, { contentType, upsert: true });

        if (error) {
          toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        newImages.push(urlData.publicUrl);
      } catch {
        toast.error(`Erro ao processar ${file.name}`);
      }
    }

    onChange(newImages);
    setUploading(false);
    setProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onChange(reordered);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  // Touch drag support
  const touchState = useRef<{ index: number; startY: number; startX: number } | null>(null);

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = { index, startY: touch.clientY, startX: touch.clientX };
  };

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchState.current === null || overIndex === null) {
      touchState.current = null;
      setOverIndex(null);
      setDragIndex(null);
      return;
    }
    const fromIdx = touchState.current.index;
    if (fromIdx !== overIndex) {
      const reordered = [...images];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(overIndex, 0, moved);
      onChange(reordered);
    }
    touchState.current = null;
    setOverIndex(null);
    setDragIndex(null);
  }, [images, onChange, overIndex]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      const item = el.closest("[data-img-index]");
      if (item) {
        const idx = Number(item.getAttribute("data-img-index"));
        setOverIndex(idx);
        setDragIndex(touchState.current.index);
      }
    }
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Imagens {images.length > 1 && <span className="font-normal normal-case">(arraste para reordenar)</span>}
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={`${img}-${i}`}
              data-img-index={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(i, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative aspect-square rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing transition-all duration-150 ${
                dragIndex === i ? "opacity-40 scale-95" : ""
              } ${overIndex === i && dragIndex !== i ? "ring-2 ring-primary scale-105" : ""}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover pointer-events-none" loading="lazy" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                  CAPA
                </span>
              )}
              <div className="absolute top-1 left-1 p-0.5 rounded bg-foreground/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-3 w-3 text-card" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando {progress}...</>
        ) : (
          <><Upload className="h-4 w-4" /> Adicionar imagens</>
        )}
      </button>
    </div>
  );
}
