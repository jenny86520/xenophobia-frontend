import type { GameVideo } from "@/types/about";

export type ClipSort = "newest" | "popular";

export type ClipVote = "like" | "dislike";

/** Whether a member may use a feature now (the backend decides): paused site-wide, or not in their role. */
export type ClipAccess = "allowed" | "paused" | "denied";

export type ReportCategory =
  "inappropriate" | "infringement" | "impersonation" | "off-topic" | "other";

/** A listed video on /clips, as GET /api/clips returns it. */
export type Clip = GameVideo & {
  game: { id: string; name: string };
  createdAt: string;
  likes: number;
  dislikes: number;
  myVote: ClipVote | null;
  reported: boolean;
  canReport: boolean;
};

export type ClipList = {
  items: Clip[];
  total: number;
  page: number;
  pageSize: number;
  games: { id: string; name: string }[];
  voting: ClipAccess;
  reporting: ClipAccess;
  reportsLeftToday: number;
};
