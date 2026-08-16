import { useMemo } from "react";
import { useProperties, Property } from "@/contexts/PropertyContext";
import PropertyCard from "@/components/PropertyCard";

interface SimilarPropertiesProps {
  current: Property;
}

export default function SimilarProperties({ current }: SimilarPropertiesProps) {
  const { properties } = useProperties();

  const similar = useMemo(() => {
    const minPrice = current.price * 0.8;
    const maxPrice = current.price * 1.2;
    const candidates = properties.filter((p) => {
      if (p.id === current.id) return false;
      if (p.status === "vendido") return false;
      const priceMatch = p.price >= minPrice && p.price <= maxPrice;
      const sameNeighborhood = p.neighborhood?.toLowerCase() === current.neighborhood?.toLowerCase();
      const sameCity = p.city?.toLowerCase() === current.city?.toLowerCase();
      const closeBedrooms = Math.abs((p.bedrooms || 0) - (current.bedrooms || 0)) <= 1;
      // Score: bairro vale mais que cidade; preço próximo é desempate
      return sameNeighborhood || (sameCity && (priceMatch || closeBedrooms));
    });

    const scored = candidates
      .map((p) => {
        let score = 0;
        if (p.neighborhood?.toLowerCase() === current.neighborhood?.toLowerCase()) score += 5;
        if (p.city?.toLowerCase() === current.city?.toLowerCase()) score += 2;
        if (p.price >= minPrice && p.price <= maxPrice) score += 3;
        if (Math.abs((p.bedrooms || 0) - (current.bedrooms || 0)) <= 1) score += 2;
        if (p.type === current.type) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.p);

    return scored;
  }, [properties, current]);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16 mb-12" aria-labelledby="similar-heading">
      <h2 id="similar-heading" className="text-2xl font-serif font-bold mb-6 px-1">
        Imóveis similares
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similar.map((p, i) => (
          <PropertyCard key={p.id} property={p} index={i} />
        ))}
      </div>
    </section>
  );
}
