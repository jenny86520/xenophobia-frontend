import type { IceEvent, IceStatus } from "@/types/ice-cream";

/** 「冰炫風 #12」 */
export function iceCreamName(serial: number): string {
  return `冰炫風 #${serial}`;
}

export const ICE_STATUS_TEXT: Record<IceStatus, string> = {
  held: "持有中",
  gifting: "贈送中",
  redeeming: "兌換中",
  confirming: "等驗收",
  retired: "功成身退",
  deleted: "已刪除",
};

/** One line of the growth record for an event the backend recorded. */
export function describeIceEvent(event: IceEvent): string {
  const actor = event.actor?.nickname ?? "";
  const target = event.target?.nickname ?? "";
  switch (event.type) {
    case "created":
      return `${actor} 建立了這支冰炫風`;
    case "issued":
      return `管理員發給 ${target}`;
    case "claimed":
      return `${target} 從點數商店兌換：${event.note}`;
    case "gifted":
      return `${actor} 送給 ${target}`;
    case "accepted":
      return `${actor} 收下了 ${target} 送的冰炫風`;
    case "declined":
      return `${actor} 退回給 ${target}`;
    case "auto_returned":
      return `24 小時未接收，自動退回給 ${target}`;
    case "unfriend_returned":
      return `解除好友，自動退回給 ${target}`;
    case "recipient_left":
      return `受贈的會員已離開，退回給 ${target}`;
    case "redeem_requested":
      return target ? `${actor} 向 ${target} 申請兌換` : `${actor} 向管理員申請兌換`;
    case "redeem_cancelled":
      return `${actor} 撤回兌換申請`;
    case "redeemed_points":
      return `${actor} 以 3 點兌換給 ${target}，功成身退`;
    case "redeemed_physical":
      return `${actor} 請 ${target} 吃了冰炫風，功成身退`;
    case "physical_claimed":
      return `${actor} 說請 ${target} 吃了一支，等驗收`;
    case "physical_confirmed":
      return `${actor} 確認吃到了，功成身退`;
    case "physical_disputed":
      return `${actor} 說沒吃到，退回兌換中`;
    case "physical_auto_confirmed":
      return `72 小時沒回應，當作 ${target} 吃到了，功成身退`;
    case "deleted":
      return `${actor} 刪除了這支冰炫風`;
    case "issuer_left":
      return "發行人已離開，功成身退";
    case "holder_left":
      return target ? `持有人已離開，回到 ${target} 手上` : "持有人已離開，功成身退";
    default:
      return event.type;
  }
}
