import { Ban, CircleSlash, Lock, MapPinned, ShieldCheck, Shuffle, UserPlus } from "lucide-react";
import type { MatchStatus } from "@/types/match";

export const MATCH_STATUS_TEXT: Record<MatchStatus, string> = {
  lobby: "報名中",
  roster_locked: "名單已鎖定",
  team_draft: "分隊中",
  teams_confirmed: "隊伍已確認",
  veto_active: "Ban 圖中",
  veto_complete: "地圖已決定",
  cancelled: "已取消",
};

const ICON = {
  lobby: UserPlus,
  roster_locked: Lock,
  team_draft: Shuffle,
  teams_confirmed: ShieldCheck,
  veto_active: Ban,
  veto_complete: MapPinned,
  cancelled: CircleSlash,
} as const;

/** The status as text plus an icon (never colour alone). */
export function MatchStatusLabel({ status }: { status: MatchStatus }) {
  const Icon = ICON[status];
  return (
    <span className="inline-flex items-center gap-2 text-body text-ink">
      <Icon aria-hidden="true" className="size-4 text-signal" />
      {MATCH_STATUS_TEXT[status]}
    </span>
  );
}
