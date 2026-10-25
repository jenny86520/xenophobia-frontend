/** The member page's tabs, in display order; the first is the default. */
export const MEMBER_TABS = [
  { value: "parties", label: "參加的活動" },
  { value: "matches", label: "內戰場次" },
  { value: "nickname", label: "修改暱稱" },
  { value: "videos", label: "投稿影片" },
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
