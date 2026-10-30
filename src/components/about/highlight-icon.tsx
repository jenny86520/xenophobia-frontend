import {
  CalendarDays,
  Clapperboard,
  Gamepad2,
  Globe,
  Heart,
  Megaphone,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drawings for the backend's highlight icon codes (HIGHLIGHT_ICONS in highlights/highlight-icons.ts).
 * The admin picker maps the same codes to the same lucide icons, so what is picked is what shows here.
 */
export const HIGHLIGHT_ICONS: Record<string, LucideIcon> = {
  party: PartyPopper,
  users: Users,
  trophy: Trophy,
  shield: ShieldCheck,
  globe: Globe,
  sparkles: Sparkles,
  gamepad: Gamepad2,
  swords: Swords,
  video: Clapperboard,
  calendar: CalendarDays,
  megaphone: Megaphone,
  heart: Heart,
};

/** A code the backend never sends (or an older backend without icons) falls back to sparkles. */
export function highlightIcon(code: string | undefined): LucideIcon {
  return (code && HIGHLIGHT_ICONS[code]) || Sparkles;
}

/** Decorative: the highlight's title and content name it. */
export function HighlightIcon({ code, className }: { code: string | undefined; className?: string }) {
  const Icon = (code && HIGHLIGHT_ICONS[code]) || Sparkles;
  return <Icon aria-hidden="true" data-highlight-icon={code} className={cn("shrink-0", className)} />;
}
