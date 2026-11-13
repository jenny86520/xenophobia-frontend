/** Names of the backend's ledger kinds; an unknown kind (added later) shows its code. */
const POINT_KIND_LABELS: Record<string, string> = {
  checkin: "每日簽到",
  streak_bonus: "連續簽到獎勵",
  ice_create: "建立冰炫風",
  ice_redeem_paid: "兌換冰炫風付出",
  ice_redeem_received: "兌換冰炫風收到",
  manual_grant: "管理員補發",
  party_attend: "派對到場",
  sub_party_attend: "子派對到場",
  attendance_revoked: "取消到場",
  scrim_play: "參加內戰",
  video_accepted: "投稿影片入選",
};

export function pointKindLabel(kind: string): string {
  return POINT_KIND_LABELS[kind] ?? kind;
}

/** A ledger amount with its sign: +1, −3. */
export function formatPointAmount(amount: number): string {
  return amount > 0 ? `+${amount}` : `−${Math.abs(amount)}`;
}
