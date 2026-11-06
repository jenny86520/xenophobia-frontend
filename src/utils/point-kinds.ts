/** Names of the backend's ledger kinds; an unknown kind (added later) shows its code. */
const POINT_KIND_LABELS: Record<string, string> = {
  checkin: "每日簽到",
  streak_bonus: "連續簽到獎勵",
};

export function pointKindLabel(kind: string): string {
  return POINT_KIND_LABELS[kind] ?? kind;
}

/** A ledger amount with its sign: +1, −3. */
export function formatPointAmount(amount: number): string {
  return amount > 0 ? `+${amount}` : `−${Math.abs(amount)}`;
}
