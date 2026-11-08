import { CalendarCheck, Clapperboard, Coins, Swords, UserRound, Users } from "lucide-react";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";

/** The member page's tabs, in display order; the first is the default. The icon is decorative. */
export const MEMBER_TABS = [
  { value: "profile", label: "個人資料", icon: UserRound },
  { value: "parties", label: "參加的活動", icon: CalendarCheck },
  { value: "matches", label: "內戰場次", icon: Swords },
  { value: "friends", label: "好友", icon: Users },
  { value: "videos", label: "投稿影片", icon: Clapperboard },
  { value: "points", label: "點數", icon: Coins },
  { value: "ice-creams", label: "冰炫風", icon: IceCreamIcon },
] as const;

export type MemberTab = (typeof MEMBER_TABS)[number]["value"];

/** The tab named by `?tab=`; anything missing or unknown is the first tab. */
export function parseMemberTab(value: string | string[] | undefined): MemberTab {
  const tab = MEMBER_TABS.find((item) => item.value === value);
  return tab ? tab.value : MEMBER_TABS[0].value;
}

/** The URL of a tab; the default tab is plain /member. */
export function memberTabHref(tab: MemberTab): string {
  return tab === MEMBER_TABS[0].value ? "/member" : `/member?tab=${tab}`;
}
