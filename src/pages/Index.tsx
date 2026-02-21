import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-mansion.jpg";
import { useProperties, formatPriceFull } from "@/contexts/PropertyContext";
import { Ruler, BedDouble, Car } from "lucide-react";
import PageTransition from "@/components/PageTransition";

export default function Index() {
  const navigate = useNavigate();
  const { properties, settings, favorites, toggleFavorite } = useProperties();
  const featured = properties.filter((p) => p.featured);

  return (
    <PageTransition>
      <div className="relative flex min-h-screen w-full flex-col bg-luxury-dark overflow-x-hidden pb-24">
        {/* Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-nav border-b border-card/10 max-w-md mx-auto">
          <button onClick={() => navigate("/admin")} className="text-accent">
            <span className="text-2xl">☰</span>
          </button>
          <h1 className="font-serif text-xl font-bold tracking-widest text-accent uppercase">{settings.heroSubtitle}</h1>
          <button onClick={() => navigate("/login")} className="text-card">
            <span className="text-2xl">👤</span>
          </button>
        </nav>

        {/* Hero */}
        <section className="relative h-[85vh] w-full shrink-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
            <div className="absolute inset-0 hero-gradient" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-serif text-4xl text-card leading-tight mb-6"
            >
              {settings.heroTitle.split("seus sonhos")[0]}
              <span className="italic text-accent">seus sonhos</span>
            </motion.h2>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              onClick={() => navigate("/busca")}
              className="flex min-w-[160px] items-center justify-center overflow-hidden rounded-full h-12 px-8 border-2 border-accent text-accent bg-transparent text-sm font-bold uppercase tracking-[0.2em] transition-all hover:bg-accent hover:text-accent-foreground"
            >
              Conheça
            </motion.button>
            <div className="mt-8 flex gap-2">
              <div className="w-8 h-1 bg-accent rounded-full" />
              <div className="w-2 h-1 bg-card/30 rounded-full" />
              <div className="w-2 h-1 bg-card/30 rounded-full" />
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="relative -mt-12 z-10 bg-luxury-dark rounded-t-xl pb-8">
          <div className="px-6 pt-8 pb-4 flex justify-between items-end">
            <div>
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Exclusividade</span>
              <h3 className="text-2xl font-serif text-card mt-1">Destaques</h3>
            </div>
            <button onClick={() => navigate("/busca")} className="text-primary text-sm font-semibold flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-5 px-6 pb-6">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="flex flex-col min-w-[280px] bg-luxury-dark-lighter/40 rounded-xl overflow-hidden border border-card/5 cursor-pointer"
                onClick={() => navigate(`/imovel/${p.id}`)}
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  <button
                    className="absolute top-3 right-3 bg-foreground/50 backdrop-blur-md p-1.5 rounded-full"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(p.id) ? "fill-accent text-accent" : "text-card"}`} />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-accent text-lg font-bold">{formatPriceFull(p.price)}</p>
                  <p className="text-card/70 text-sm font-medium mb-3">{p.title} - {p.neighborhood}</p>
                  <div className="flex items-center gap-4 text-card/50 text-xs uppercase tracking-tighter">
                    <div className="flex items-center gap-1"><Ruler className="h-3 w-3 text-primary" />{p.area}m²</div>
                    <div className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-primary" />{p.suites} Suítes</div>
                    <div className="flex items-center gap-1"><Car className="h-3 w-3 text-primary" />{p.parking} Vagas</div>
                  </div>
                </div>
              </motion.div>
            ))}
            {featured.length === 0 && (
              <p className="text-card/50 text-sm">Nenhum imóvel em destaque. Adicione pelo admin.</p>
            )}
          </div>

          {/* Collections */}
          <div className="px-6 py-6">
            <h4 className="text-card font-serif text-lg mb-4">Coleções</h4>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate("/busca")} className="h-24 rounded-lg bg-luxury-dark-lighter/60 flex flex-col justify-center items-center border border-card/5">
                <span className="text-card font-bold tracking-widest text-xs uppercase">Casas de Praia</span>
              </button>
              <button onClick={() => navigate("/busca")} className="h-24 rounded-lg bg-luxury-dark-lighter/60 flex flex-col justify-center items-center border border-card/5">
                <span className="text-card font-bold tracking-widest text-xs uppercase">Coberturas</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
