import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Verified, Globe, Camera, Mail } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { toast } from "sonner";

export default function Contact() {
  const navigate = useNavigate();
  const { settings } = useProperties();
  const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensagem enviada com sucesso!");
    setForm({ name: "", email: "", phone: "", interest: "" });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-32 bg-background">
      <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-header border-b border-border">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-serif text-lg font-bold tracking-widest text-accent uppercase">JHR LUXURY</h1>
        <div className="w-8" />
      </nav>

      <header className="px-6 pt-10 pb-6 text-center">
        <h2 className="font-serif text-4xl mb-2">Fale Conosco</h2>
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
            <div key={key} className="relative">
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={label}
                className="w-full border-0 border-b border-border bg-transparent pb-2 pt-4 text-sm focus:outline-none focus:border-accent placeholder:text-muted-foreground placeholder:uppercase placeholder:text-xs placeholder:tracking-wider"
              />
            </div>
          ))}
          <select
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
            className="w-full border-0 border-b border-border bg-transparent pb-2 pt-4 text-sm focus:outline-none focus:border-accent text-muted-foreground uppercase text-xs tracking-wider"
          >
            <option value="">Interesse</option>
            <option value="buy">Comprar Imóvel</option>
            <option value="sell">Vender Imóvel</option>
            <option value="concierge">Serviço de Concierge</option>
          </select>
          <button
            type="submit"
            className="w-full gold-gradient text-accent-foreground font-bold py-4 rounded-sm uppercase tracking-[0.2em] text-xs shadow-lg mt-8"
          >
            Enviar Mensagem
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

      <footer className="px-6 py-10 border-t border-border flex flex-col items-center gap-6">
        <div className="flex gap-8">
          <Globe className="h-6 w-6 text-accent" />
          <Camera className="h-6 w-6 text-accent" />
          <Mail className="h-6 w-6 text-accent" />
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
          © 2024 JHR Imóveis de Luxo<br />Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
