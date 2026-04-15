import {
  Waves, Flame, Dumbbell, Thermometer, TreePine, Building2,
  UtensilsCrossed, Baby, PartyPopper, ShieldCheck, Trophy, Sparkles,
  Clapperboard, Wine, Bath, Droplets, Sun, Wind, Wifi, Lock,
  ParkingCircle, Dog, Shirt, Sofa, Gamepad2, BookOpen,
  Heater, Refrigerator, AirVent, Fence, LucideIcon,
  Car, Phone, DoorOpen, Lamp, Footprints, Coffee,
  Blinds, CircleParking, Home, Tv, Music, Umbrella,
  Bike, Leaf, Flower2, HandMetal, Wrench, Zap,
  Hammer, Cable, CookingPot, BatteryCharging, Armchair, Brush,
  ChefHat, Plug, ShowerHead, KeyRound, Warehouse, CircleDot,
  Maximize2
} from "lucide-react";

const amenityIconMap: Record<string, LucideIcon> = {
  // Lazer & Esportes
  "Piscina": Waves,
  "Piscina Aquecida": Droplets,
  "Churrasqueira": Flame,
  "Academia": Dumbbell,
  "Sauna": Thermometer,
  "Quadra Esportiva": Trophy,
  "Spa": Sparkles,
  "Playground": Baby,
  "Salão de Festas": PartyPopper,
  "Home Cinema": Clapperboard,
  "Sala de Jogos": Gamepad2,
  "Lounge": Sofa,
  "Bicicletário": Bike,
  "Espaço Zen": Leaf,

  // Áreas externas
  "Jardim": TreePine,
  "Varanda Gourmet": UtensilsCrossed,
  "Área de Sol": Sun,
  "Área Cercada": Fence,
  "Deck": Footprints,
  "Terraço": Maximize2,
  "Espaço Gourmet": ChefHat,
  "Pergolado": Umbrella,

  // Infraestrutura
  "Elevador": Building2,
  "Segurança 24h": ShieldCheck,
  "Portaria 24h": Lock,
  "Garagem": Car,
  "Vaga de Garagem": Car,
  "Estacionamento": ParkingCircle,
  "Portão Automático": DoorOpen,
  "Portão Eletrônico": DoorOpen,
  "Interfone": Phone,
  "Videoporteiro": Tv,
  "Câmeras de Segurança": CircleDot,
  "Cerca Elétrica": Zap,
  "Gerador": BatteryCharging,
  "Cisterna": Droplets,

  // Conforto
  "Ar Condicionado": AirVent,
  "Ventilação Natural": Wind,
  "Wi-Fi": Wifi,
  "Lareira": Heater,
  "Iluminação LED": Lamp,
  "Piso Aquecido": Heater,
  "Cortina Elétrica": Blinds,
  "Automação Residencial": Plug,
  "Aquecimento Central": Heater,
  "Som Ambiente": Music,

  // Serviços & Utilidades
  "Lavanderia": Shirt,
  "Lavabo": Bath,
  "Pet Friendly": Dog,
  "Biblioteca": BookOpen,
  "Adega": Wine,
  "Frigobar": Refrigerator,
  "Espaço Coworking": Coffee,
  "Depósito": Warehouse,
  "Despensa": CookingPot,
  "Closet": Armchair,
  "Chave Digital": KeyRound,
};

export function getAmenityIcon(name: string): LucideIcon | null {
  return amenityIconMap[name] || null;
}

export default amenityIconMap;
