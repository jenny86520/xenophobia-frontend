import { CalendarCheck, Clapperboard, PartyPopper, Sparkles, Swords, UserPlus, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { SteamIcon } from "@/components/player/steam-icon";

type QuestIcon = LucideIcon | ComponentType<{ className?: string }>;

/**
 * How each newbie quest looks and where 「去完成」 leads. Presentation only: the quests, their
 * conditions and states come from the backend, and a code added there later gets the default icon
 * and no link until it is listed here.
 */
const QUEST_LOOKS: Record<string, { icon: QuestIcon; href: string }> = {
  steam: { icon: SteamIcon, href: "/member" },
  friend: { icon: UserPlus, href: "/member?tab=friends" },
  party: { icon: PartyPopper, href: "/party" },
  scrim: { icon: Swords, href: "/matches" },
  video: { icon: Clapperboard, href: "/member?tab=videos" },
  checkin: { icon: CalendarCheck, href: "/member?tab=points" },
};

export function questIcon(code: string): QuestIcon {
  return QUEST_LOOKS[code]?.icon ?? Sparkles;
}

/** The page where the quest can be done; null for a code this site does not know yet. */
export function questHref(code: string): string | null {
  return QUEST_LOOKS[code]?.href ?? null;
}
