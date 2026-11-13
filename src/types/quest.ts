/** A newbie quest's state, decided by the backend; null in the shop for visitors. */
export type QuestState = "todo" | "claimable" | "claimed";

/** One newbie quest (GET /api/member/quests, and the shop's `quests`). */
export type Quest = {
  code: string;
  title: string;
  description: string;
  points: number;
  state: QuestState;
};

export type ShopQuest = Omit<Quest, "state"> & { state: QuestState | null };

/** POST /api/member/quests/:code/claim. */
export type QuestClaimResult = { code: string; points: number; balance: number };
