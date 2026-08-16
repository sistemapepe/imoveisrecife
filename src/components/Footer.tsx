import { useProperties } from "@/contexts/PropertyContext";
import { useNavigate } from "react-router-dom";
import { Globe, Mail, Settings } from "lucide-react";
// Usando SVG simples para ícones sociais que podem faltar no Lucide
const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
const Facebook = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

/** Aceita "user", "@user", "instagram.com/user" ou URL completa e devolve sempre uma URL absoluta */
function normalizeSocialUrl(value: string, platform: "instagram" | "facebook" | "youtube" | "linkedin" | "website"): string {
  const v = (value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "").replace(/^\/+/, "");
  const base: Record<typeof platform, string> = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/@",
    linkedin: "https://linkedin.com/in/",
    website: "https://",
  };
  if (handle.includes(".") || handle.includes("/")) return `https://${handle}`;
  return `${base[platform]}${handle}`;
}

export default function Footer() {
  const { settings } = useProperties();
  const navigate = useNavigate();

  return (
    <footer className="px-6 py-20 mt-20 border-t border-white/5 flex flex-col items-center gap-10 mb-24 bg-[#0d1419]">
      <div className="flex gap-6 flex-wrap justify-center">
        {settings.instagramUrl && (
          <a href={normalizeSocialUrl(settings.instagramUrl, "instagram")} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-accent hover:scale-110 transition-transform">
            <Instagram className="h-5 w-5" />
          </a>
        )}
        {settings.facebookUrl && (
          <a href={normalizeSocialUrl(settings.facebookUrl, "facebook")} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-accent hover:scale-110 transition-transform">
            <Facebook className="h-5 w-5" />
          </a>
        )}
        {settings.youtubeUrl && (
          <a href={normalizeSocialUrl(settings.youtubeUrl, "youtube")} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-accent hover:scale-110 transition-transform">
            <Youtube className="h-5 w-5" />
          </a>
        )}
        {settings.linkedinUrl && (
          <a href={normalizeSocialUrl(settings.linkedinUrl, "linkedin")} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-accent hover:scale-110 transition-transform">
            <Linkedin className="h-5 w-5" />
          </a>
        )}
        {settings.websiteUrl && (
          <a href={normalizeSocialUrl(settings.websiteUrl, "website")} target="_blank" rel="noopener noreferrer" aria-label="Site" className="text-accent hover:scale-110 transition-transform">
            <Globe className="h-5 w-5" />
          </a>
        )}
        {settings.emailContact && (
          <a href={`mailto:${settings.emailContact}`} aria-label="E-mail" className="text-accent hover:scale-110 transition-transform">
            <Mail className="h-5 w-5" />
          </a>
        )}
      </div>

      {settings.footerText && (
        <p className="text-[10px] text-white/50 font-extrabold uppercase tracking-[0.25em] text-center whitespace-pre-line max-w-sm leading-relaxed">
          {settings.footerText}
        </p>
      )}

      {(settings.creci || settings.creciUf) && (
        <p className="text-[10px] font-extrabold text-accent uppercase tracking-[0.3em] text-center border border-accent/20 rounded-full px-6 py-2 bg-accent/5 premium-shadow">
          CRECI{settings.creciUf ? ` - ${settings.creciUf}` : ""}{settings.creci ? ` ${settings.creci}` : ""}
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
