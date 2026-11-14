import { CalendarCheck, Clapperboard, PartyPopper, Sparkles, Swords, UserPlus, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { SteamIcon } from "@/components/player/steam-icon";

type QuestIcon = LucideIcon | ComponentType<{ className?: string }>;

/** Where 「去完成」 leads: a page, or the friends sidebar opened where the member already is. */
export type QuestGoal = { kind: "link"; href: string } | { kind: "friends-panel" };

const link = (href: string): QuestGoal => ({ kind: "link", href });

/**
 * How each newbie quest looks and where 「去完成」 leads. Presentation only: the quests, their
 * conditions and states come from the backend, and a code added there later gets the default icon
 * and no goal until it is listed here.
 */
const QUEST_LOOKS: Record<string, { icon: QuestIcon; goal: QuestGoal }> = {
  steam: { icon: SteamIcon, goal: link("/member") },
  friend: { icon: UserPlus, goal: { kind: "friends-panel" } },
  party: { icon: PartyPopper, goal: link("/party") },
  scrim: { icon: Swords, goal: link("/matches") },
  video: { icon: Clapperboard, goal: link("/member?tab=videos") },
  checkin: { icon: CalendarCheck, goal: link("/member?tab=points") },
};

export function questIcon(code: string): QuestIcon {
  return QUEST_LOOKS[code]?.icon ?? Sparkles;
}

/** Where the quest can be done; null for a code this site does not know yet. */
export function questGoal(code: string): QuestGoal | null {
  return QUEST_LOOKS[code]?.goal ?? null;
}
