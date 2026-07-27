import type { ContentIconKey } from "@shared/types/contentPage";
import {
  Calendar,
  Check,
  CreditCard,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
  Truck,
  type LucideIcon,
} from "lucide-react";

export const CONTENT_ICON_MAP: Record<ContentIconKey, LucideIcon> = {
  search: Search,
  eye: Eye,
  heart: Heart,
  cart: ShoppingCart,
  creditCard: CreditCard,
  package: Package,
  truck: Truck,
  calendar: Calendar,
  shield: Shield,
  messageCircle: MessageCircle,
  mapPin: MapPin,
  sparkles: Sparkles,
  rotateCcw: RotateCcw,
  check: Check,
};

export const CONTENT_ICON_LABELS: Record<ContentIconKey, string> = {
  search: "Busca",
  eye: "Olhar",
  heart: "Favorito",
  cart: "Carrinho",
  creditCard: "Pagamento",
  package: "Pacote",
  truck: "Frete",
  calendar: "Calendário",
  shield: "Proteção",
  messageCircle: "Mensagem",
  mapPin: "Local",
  sparkles: "Destaque",
  rotateCcw: "Troca",
  check: "Confirmação",
};

export function ContentIcon({
  iconKey,
  className,
  size = 22,
}: {
  iconKey: ContentIconKey;
  className?: string;
  size?: number;
}) {
  const Icon = CONTENT_ICON_MAP[iconKey] ?? Check;
  return <Icon className={className} size={size} aria-hidden />;
}
