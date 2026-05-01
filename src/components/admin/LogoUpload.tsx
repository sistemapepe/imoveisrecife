import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl } from "@/lib/image-optimization";
import { toast } from "sonner";

interface LogoUploadProps {
  logoUrl: string;
  onChange: (url: string) => void;
}

export default function LogoUpload({ logoUrl, onChange }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const fileName = `logo-${Date.now()}.${ext}`;
    const filePath = `branding/${fileName}`;

    const { error } = await supabase.storage
      .from("property-images")
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (error) {
      toast.error("Erro ao enviar logo: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(filePath);

    onChange(urlData.publicUrl);
    setUploading(false);
    toast.success("Logo atualizado!");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <ImageIcon className="h-4 w-4" /> Logo da Marca
      </label>

      {logoUrl ? (
        <div className="relative inline-block">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-16 max-w-[200px] object-contain rounded-lg border border-border bg-background p-2"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground shadow"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Nenhum logo. O nome da marca será usado como texto.</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-xs hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> Enviando...</>
        ) : (
          <><Upload className="h-3 w-3" /> {logoUrl ? "Trocar logo" : "Enviar logo"}</>
        )}
      </button>
    </div>
  );
}
