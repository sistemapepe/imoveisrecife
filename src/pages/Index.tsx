import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SEOHead from "@/components/SEOHead";
import PageTransition from "@/components/PageTransition";
import { useProperties } from "@/contexts/PropertyContext";
import { getVisibleProperties } from "@/lib/property-visibility";

export default function Index() {
  const navigate = useNavigate();
  const { properties, settings, loading } = useProperties();
  const [search, setSearch] = useState("");

  const visibleProperties = useMemo(() => {
    const publicProperties = getVisibleProperties(properties || []);
    const term = search.trim().toLowerCase();
    if (!term) return publicProperties;
    return publicProperties.filter((property) =>
      [property.title, property.neighborhood, property.city, property.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [properties, search]);

  const featuredProperties = visibleProperties.slice(0, 6);
  const heroTitle = settings?.heroTitle || "Encontre o imóvel ideal para sua próxima história";
  const brandName = settings?.brandName || "Imóveis Recife";

  return (
    <PageTransition>
      <SEOHead title={brandName} description={heroTitle} />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <main>
          <section className="relative overflow-hidden border-b border-border bg-muted px-4 py-16 sm:px-6 md:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Recife e região
                </p>
                <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                  {heroTitle}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Encontre casas, apartamentos, terrenos e imóveis exclusivos com atendimento próximo e seguro.
                </p>

                <form
                  className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    navigate(search ? `/busca?search=${encodeURIComponent(search)}` : "/busca");
                  }}
                >
                  <label className="flex min-w-0 flex-1 items-center gap-3 px-2">
                    <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="sr-only">Buscar imóvel</span>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Bairro, cidade ou tipo de imóvel"
                      className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Buscar
                  </button>
                </form>
              </div>

              <div className="hidden justify-end lg:flex" aria-hidden="true">
                <div className="max-w-sm border-l-2 border-primary/40 pl-8">
                  <MapPin className="mb-5 h-8 w-8 text-primary" />
                  <p className="font-serif text-3xl leading-tight">Seu próximo endereço começa aqui.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Destaques</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Imóveis selecionados</h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/busca")}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Ver todos
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Carregando imóveis">
                  {[1, 2, 3].map((item) => <div key={item} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />)}
                </div>
              ) : featuredProperties.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredProperties.map((property, index) => <PropertyCard key={property.id} property={property} index={index} />)}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                  <h3 className="font-serif text-2xl">Nenhum imóvel encontrado</h3>
                  <p className="mt-2 text-muted-foreground">Tente outra busca ou veja todos os imóveis disponíveis.</p>
                  <button type="button" onClick={() => { setSearch(""); navigate("/busca"); }} className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">Explorar imóveis</button>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
