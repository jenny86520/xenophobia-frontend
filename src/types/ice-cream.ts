import type { CupStock, CupView, ShopCosmetic } from "./cosmetic";
import type { ShopQuest } from "./quest";

/** A person on a token: the site only ever gets a nickname (「管理員」「已離開的會員」 included). */
export type IcePerson = { nickname: string };

export type IceStatus = "held" | "gifting" | "redeeming" | "confirming" | "retired" | "deleted";

/** What the viewing member may do; the site shows a button per action, the backend decides. */
export type IceAction =
  | "gift"
  | "accept"
  | "decline"
  | "requestRedeem"
  | "cancelRedeem"
  | "redeem"
  | "confirmPhysical"
  | "disputePhysical"
  | "delete";

export type IceCream = {
  id: string;
  serial: number;
  origin: "member" | "admin" | "campaign";
  status: IceStatus;
  issuer: IcePerson;
  holder: IcePerson | null;
  giftTo: IcePerson | null;
  giftExpiresAt: string | null;
  /** While confirming: when the holder's silence counts as having eaten it. */
  confirmExpiresAt: string | null;
  /** Back to redeeming because the holder said they never got it. */
  disputed: boolean;
  createdAt: string;
  endedAt: string | null;
  /** The cup a holder changed onto it; null or missing = the default cup. */
  cup?: CupView | null;
  actions: IceAction[];
  /** The viewing member holds it in hand and may change its cup from their stock. */
  canChangeCup?: boolean;
  /** Given by the admins or claimed in the shop, and not yet seen on the 冰炫風 tab. */
  isNew: boolean;
  /** Points the viewing member gets back if they delete it now (0 when they cannot). */
  deleteRefund?: number;
};

/** GET /api/member/ice-creams. */
export type MemberIceCreams = {
  issuing: { active: number; limit: number };
  balance: number;
  createCost: number;
  /** Whether a token can be issued now; `reason` (the backend's words) when not. */
  create: { allowed: boolean; reason: string | null };
  held: MemberIceCream[];
  incoming: MemberIceCream[];
  /** Asked to redeem, or waiting for the holder to confirm a physical one. */
  redeemRequests: MemberIceCream[];
  /** Physical redemptions waiting for the member (the holder) to confirm. */
  toConfirm: MemberIceCream[];
  friends: { memberId: string; nickname: string }[];
  /** Cups the member bought and has not used yet (offered by 換杯子). */
  cupStock?: CupStock[];
  /** Ids of the tokens shown in the scrim room, in order. */
  showcase?: string[];
};

/** One token a member shows in the scrim room (spec ice-creams): nothing about its life or state. */
export type IceShowcaseItem = {
  id: string;
  serial: number;
  /** null = the default cup. */
  cup: CupView | null;
  /** 管理員, the issuer's nickname, or 已離開的會員. */
  issuerName: string;
};

/** A token on the 冰炫風 tab, with its life so far for its detail dialog. */
export type MemberIceCream = IceCream & { events: IceEvent[] };

export type IceEvent = {
  id: string;
  serial: number;
  iceCreamId: string;
  /** Event code; the site words it (utils/ice-cream-events.ts), unknown codes show as they are. */
  type: string;
  actor: IcePerson | null;
  target: IcePerson | null;
  note: string;
  /** The token's cup right after this event; null or missing = the default cup. */
  cup?: CupView | null;
  createdAt: string;
};

/** GET /api/ice-creams: one page of the album, tokens newest first, each with its own events. */
export type IceAlbumPage = { items: IceCreamHistory[]; total: number; page: number; pageSize: number };

/** GET /api/ice-creams/:id. */
export type IceCreamHistory = {
  iceCream: Omit<IceCream, "actions" | "isNew" | "canChangeCup" | "deleteRefund">;
  events: IceEvent[];
};

/** GET /api/shop. */
export type Shop = {
  checkin: { points: number };
  streakCampaign: { title: string; endDate: string; requiredDays: number } | null;
  iceCampaigns: { id: string; title: string; endDate: string; claimed: boolean }[];
  createCost: number;
  /** The signed-in member's points; null for visitors. */
  balance: number | null;
  /** Newbie quests in order; an older backend may leave it out. */
  quests?: ShopQuest[];
  /** Cosmetics on sale in shelf order; an older backend may leave it out. */
  cosmetics?: ShopCosmetic[];
};

/** A friend's tokens on their friend page. */
export type HeldIceCream = { id: string; serial: number; status: IceStatus; issuer: string; cup?: CupView | null };
