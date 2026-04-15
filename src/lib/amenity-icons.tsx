import {
  Waves, Flame, Dumbbell, Thermometer, TreePine, Building2,
  UtensilsCrossed, Baby, PartyPopper, ShieldCheck, Trophy, Sparkles,
  Clapperboard, Wine, Bath, Droplets, Sun, Wind, Wifi, Lock,
  ParkingCircle, Dog, Shirt, Sofa, Gamepad2, BookOpen,
  Heater, Refrigerator, AirVent, Fence, LucideIcon
} from "lucide-react";

const amenityIconMap: Record<string, LucideIcon> = {
  "Piscina": Waves,
  "Churrasqueira": Flame,
  "Academia": Dumbbell,
  "Sauna": Thermometer,
  "Jardim": TreePine,
  "Elevador": Building2,
  "Varanda Gourmet": UtensilsCrossed,
  "Playground": Baby,
  "Salão de Festas": PartyPopper,
  "Segurança 24h": ShieldCheck,
  "Quadra Esportiva": Trophy,
  "Spa": Sparkles,
  "Home Cinema": Clapperboard,
  "Adega": Wine,
  "Lavabo": Bath,
  "Piscina Aquecida": Droplets,
  "Área de Sol": Sun,
  "Ventilação Natural": Wind,
  "Wi-Fi": Wifi,
  "Portaria 24h": Lock,
  "Estacionamento": ParkingCircle,
  "Pet Friendly": Dog,
  "Lavanderia": Shirt,
  "Lounge": Sofa,
  "Sala de Jogos": Gamepad2,
  "Biblioteca": BookOpen,
  "Lareira": Heater,
  "Frigobar": Refrigerator,
  "Ar Condicionado": AirVent,
  "Área Cercada": Fence,
};

export function getAmenityIcon(name: string): LucideIcon | null {
  return amenityIconMap[name] || null;
}

export default amenityIconMap;
