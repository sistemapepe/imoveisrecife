import { useProperties } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import { Instagram, Facebook, Youtube, Linkedin, Globe, Mail, Settings } from "lucide-react";

export default function Footer() {
  const { settings } = useProperties();
  const navigate = useNavigate();

  return (
    <footer className="px-6 py-10 mt-6 border-t border-card/10 flex flex-col items-center gap-6 mb-20">
      <div className="flex gap-6 flex-wrap justify-center">
        {settings.instagramUrl && (
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:scale-110 transition-transform">
            <Instagram className="h-5 w-5" />
          </a>
        )}
        {settings.facebookUrl && (
          <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:scale-110 transition-transform">
            <Facebook className="h-5 w-5" />
          </a>
        )}
        {settings.youtubeUrl && (
          <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:scale-110 transition-transform">
            <Youtube className="h-5 w-5" />
          </a>
        )}
        {settings.linkedinUrl && (
          <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:scale-110 transition-transform">
            <Linkedin className="h-5 w-5" />
          </a>
        )}
        {settings.websiteUrl && (
          <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:scale-110 transition-transform">
            <Globe className="h-5 w-5" />
          </a>
        )}
        {settings.emailContact && (
          <a href={`mailto:${settings.emailContact}`} className="text-accent hover:scale-110 transition-transform">
            <Mail className="h-5 w-5" />
          </a>
        )}
      </div>

      {settings.footerText && (
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center whitespace-pre-line max-w-sm">
          {settings.footerText}
        </p>
      )}

      <div className="flex flex-col items-center gap-2">
        {settings.developerName && (
          <p className="text-[9px] text-muted-foreground/50 tracking-wider text-center flex items-center gap-1.5">
            Desenvolvido por{" "}
            {settings.developerUrl ? (
              <a href={settings.developerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">
                {settings.developerName}
              </a>
            ) : settings.developerName}
            <button 
              onClick={() => navigate("/admin")}
              className="p-1 hover:text-accent transition-colors opacity-60 hover:opacity-100"
              title="Acesso Administrativo"
            >
              <Settings className="h-3 w-3" />
            </button>
          </p>
        )}
      </div>
    </footer>
  );
}
