import { Crown, Flame, Gem, Heart, PartyPopper, Skull, Star, Swords, Trophy, Zap, type LucideIcon } from "lucide-react";

/** Lucide drawings for the backend's TITLE_ICONS codes (keep in step with it and the admin's copy). */
export const TITLE_ICONS: Record<string, LucideIcon> = {
  crown: Crown,
  trophy: Trophy,
  star: Star,
  flame: Flame,
  zap: Zap,
  swords: Swords,
  "party-popper": PartyPopper,
  heart: Heart,
  gem: Gem,
  skull: Skull,
};
