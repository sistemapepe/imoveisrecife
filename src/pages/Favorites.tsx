import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import PropertyCard from "@/components/PropertyCard";

export default function Favorites() {
  const navigate = useNavigate();
  const { properties, favorites } = useProperties();
  const favProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 glass-header border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Favoritos</h1>
          <div className="w-10" />
        </div>
      </header>
      <main className="p-4 space-y-6">
        {favProperties.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">Nenhum favorito ainda</p>
            <p className="text-sm mt-2">Toque no ♥ para salvar imóveis</p>
          </div>
        ) : (
          favProperties.map((p) => <PropertyCard key={p.id} property={p} />)
        )}
      </main>
    </div>
  );
}
