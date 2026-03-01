import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/webp",
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
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
        const fileName = `${crypto.randomUUID()}.webp`;
        const filePath = `properties/${fileName}`;

        const { error } = await supabase.storage
          .from("property-images")
          .upload(filePath, compressed, { contentType: "image/webp", upsert: true });

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

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Imagens
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
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
