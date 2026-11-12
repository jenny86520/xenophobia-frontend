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
  actions: IceAction[];
  /** Given by the admins or claimed in the shop, and not yet seen on the 冰炫風 tab. */
  isNew: boolean;
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
  createdAt: string;
};

/** GET /api/ice-creams: one page of the album, tokens newest first, each with its own events. */
export type IceAlbumPage = { items: IceCreamHistory[]; total: number; page: number; pageSize: number };

/** GET /api/ice-creams/:id. */
export type IceCreamHistory = { iceCream: Omit<IceCream, "actions" | "isNew">; events: IceEvent[] };

/** GET /api/shop. */
export type Shop = {
  checkin: { points: number };
  streakCampaign: { title: string; endDate: string; requiredDays: number } | null;
  iceCampaigns: { id: string; title: string; endDate: string; claimed: boolean }[];
  createCost: number;
  /** The signed-in member's points; null for visitors. */
  balance: number | null;
};

/** A friend's tokens on their friend page. */
export type HeldIceCream = { id: string; serial: number; status: IceStatus; issuer: string };
