import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

export interface Property {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  city: string;
  price: number;
  area: number;
  suites: number;
  bathrooms: number;
  parking: number;
  type: "Casa" | "Apartamento" | "Cobertura" | "Terreno" | "Comercial";
  description: string;
  amenities: string[];
  images: string[];
  exclusive: boolean;
  featured: boolean;
}

export const defaultProperties: Property[] = [
  {
    id: "1",
    title: "Mansão no Jardim Europa",
    address: "Alameda Ministro Rocha Azevedo",
    neighborhood: "Jardins",
    city: "São Paulo",
    price: 18500000,
    area: 650,
    suites: 5,
    bathrooms: 7,
    parking: 8,
    type: "Casa",
    description: "Esta magnífica mansão suspensa redefine o conceito de luxo e sofisticação no coração dos Jardins. Com acabamentos em mármore italiano, automação residencial de última geração e uma vista 360º de tirar o fôlego para a cidade de São Paulo.",
    amenities: ["Piscina Privativa", "Adega", "Academia", "Segurança 24h"],
    images: [property1],
    exclusive: true,
    featured: true,
  },
  {
    id: "2",
    title: "Residência Bauhaus",
    address: "Rua dos Pinheiros, 450",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    price: 12800000,
    area: 420,
    suites: 4,
    bathrooms: 5,
    parking: 4,
    type: "Casa",
    description: "Projeto arquitetônico contemporâneo inspirado no movimento Bauhaus, com integração total entre os ambientes e paisagismo tropical assinado.",
    amenities: ["Piscina", "Jardim", "Home Theater", "Espaço Gourmet"],
    images: [property2],
    exclusive: true,
    featured: true,
  },
  {
    id: "3",
    title: "Sky Garden Penthouse",
    address: "Av. Faria Lima, 3000",
    neighborhood: "Itaim Bibi",
    city: "São Paulo",
    price: 25000000,
    area: 800,
    suites: 5,
    bathrooms: 6,
    parking: 6,
    type: "Cobertura",
    description: "Cobertura duplex com terraço panorâmico, piscina privativa com borda infinita e vista 360° da cidade. O ápice do luxo urbano.",
    amenities: ["Piscina Borda Infinita", "Terraço Panorâmico", "Spa", "Wine Cellar"],
    images: [property3],
    exclusive: false,
    featured: true,
  },
  {
    id: "4",
    title: "Mansão Suspensa no Jardins",
    address: "Alameda Santos, 1200",
    neighborhood: "Jardins",
    city: "São Paulo",
    price: 15000000,
    area: 800,
    suites: 4,
    bathrooms: 6,
    parking: 6,
    type: "Apartamento",
    description: "Apartamento de altíssimo padrão com pé-direito duplo, janelas do piso ao teto e acabamentos em mármore importado.",
    amenities: ["Piscina Privativa", "Adega", "Academia", "Segurança 24h"],
    images: [property4],
    exclusive: true,
    featured: false,
  },
];

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `R$ ${(price / 1000000).toFixed(1).replace(".", ",")}M`;
  }
  return `R$ ${price.toLocaleString("pt-BR")}`;
}

export function formatPriceFull(price: number): string {
  return `R$ ${price.toLocaleString("pt-BR")}`;
}
