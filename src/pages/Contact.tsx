import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Verified, Globe, Instagram, Facebook, Youtube, Linkedin, Mail } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import SEOHead from "@/components/SEOHead";

export default function Contact() {
  const navigate = useNavigate();
  const { settings } = useProperties();
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      interest: form.interest,
      message: form.message,
    });
    setSending(false);
    if (error) { toast.error("Erro ao enviar"); return; }
    toast.success("Mensagem enviada com sucesso!");
    setForm({ name: "", email: "", phone: "", interest: "", message: "" });
  };

  return (
    <PageTransition>
      <SEOHead title="Contato" description="Entre em contato com nossa equipe de corretores especializados em imóveis de luxo em Recife." />
      <div className="relative flex min-h-screen w-full flex-col pb-32 bg-background">
        <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-header border-b border-border">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-6 w-6" /></button>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.brandName} className="h-12 max-w-[200px] object-contain" />
          ) : (
            <h1 className="font-serif text-lg font-bold tracking-widest text-accent uppercase">{settings.brandName}</h1>
          )}
          <div className="w-8" />
        </nav>

        <header className="px-6 pt-10 pb-6 text-center">
          <h2 className="font-serif text-4xl mb-2">Atendimento Exclusivo</h2>
          <div className="w-12 h-[1px] bg-accent mx-auto" />
        </header>

        <section className="px-6 mb-10">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent p-1 bg-secondary flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div className="absolute bottom-0 right-0 bg-accent w-6 h-6 rounded-full flex items-center justify-center border-2 border-card">
                <Verified className="h-3 w-3 text-accent-foreground" />
              </div>
            </div>
            <h3 className="font-serif text-xl">{settings.conciergeNome}</h3>
            <p className="text-accent text-xs font-bold uppercase tracking-widest mt-1">{settings.conciergeCargo}</p>
            <p className="text-muted-foreground text-xs text-center mt-3 max-w-[280px] leading-relaxed">{settings.conciergeDesc}</p>
          </div>
        </section>

        <section className="px-8 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { label: "Nome Completo", key: "name", type: "text" },
              { label: "E-mail", key: "email", type: "email" },
              { label: "Telefone", key: "phone", type: "tel" },
            ].map(({ label, key, type }) => (
              <input
                key={key}
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={label}
                required={key !== "phone"}
                className="w-full border-0 border-b border-border bg-transparent pb-2 pt-4 text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground placeholder:uppercase placeholder:text-xs placeholder:tracking-wider"
              />
            ))}
            <select
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
              className="w-full border-0 border-b border-border bg-transparent pb-2 pt-4 text-sm focus:outline-none focus:border-accent text-muted-foreground uppercase text-xs tracking-wider"
            >
              <option value="">Interesse</option>
              <option value="Comprar Imóvel">Comprar Imóvel</option>
              <option value="Vender Imóvel">Vender Imóvel</option>
              <option value="Alugar Imóvel">Alugar Imóvel</option>
              <option value="Serviço de Concierge">Serviço de Concierge</option>
              <option value="Outro">Outro</option>
            </select>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Sua mensagem"
              rows={4}
              className="w-full border border-border rounded-lg bg-transparent p-3 mt-2 text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground placeholder:uppercase placeholder:text-xs placeholder:tracking-wider resize-none"
            />
            <button type="submit" disabled={sending} className="w-full gold-gradient text-accent-foreground font-bold py-4 rounded-sm uppercase tracking-[0.2em] text-xs shadow-lg mt-8 disabled:opacity-50">
              {sending ? "Enviando..." : "Solicitar Contato"}
            </button>
          </form>
        </section>

        <div className="px-8 mb-10">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Ou se preferir</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>
        </div>

        {settings.whatsappNumber && (
          <section className="px-8 mb-16">
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full border border-whatsapp text-whatsapp font-bold py-4 rounded-sm uppercase tracking-[0.2em] text-xs transition-all hover:bg-whatsapp/5"
            >
              💬 Falar pelo WhatsApp
            </a>
          </section>
        )}

        <footer className="px-6 py-10 border-t border-border flex flex-col items-center gap-6">
          <div className="flex gap-8">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram className="h-6 w-6 text-accent hover:scale-110 transition-transform" /></a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook className="h-6 w-6 text-accent hover:scale-110 transition-transform" /></a>
            )}
            {settings.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube className="h-6 w-6 text-accent hover:scale-110 transition-transform" /></a>
            )}
            {settings.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="h-6 w-6 text-accent hover:scale-110 transition-transform" /></a>
            )}
            {settings.websiteUrl && (
              <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer"><Globe className="h-6 w-6 text-accent hover:scale-110 transition-transform" /></a>
            )}
            {settings.emailContact && (
              <a href={`mailto:${settings.emailContact}`}><Mail className="h-6 w-6 text-accent hover:scale-110 transition-transform" /></a>
            )}
          </div>
          {settings.footerText && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center whitespace-pre-line">
              {settings.footerText}
            </p>
          )}
          {settings.developerName && (
            <p className="text-[9px] text-muted-foreground/50 tracking-wider text-center mt-2">
              Desenvolvido por{" "}
              {settings.developerUrl ? (
                <a href={settings.developerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">
                  {settings.developerName}
                </a>
              ) : settings.developerName}
            </p>
          )}
        </footer>
      </div>
    </PageTransition>
  );
}
