import type {
  ClipAccess,
  ClipSort,
  ClipVote,
  ReportCategory,
} from "@/types/clip";

/** What /clips shows, read from its URL; anything unknown falls back to the defaults. */
export type ClipQuery = { gameId: string | null; sort: ClipSort; page: number };

type SearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

export function parseClipQuery(params: SearchParams): ClipQuery {
  const gameId = one(params.game);
  const page = one(params.page);
  return {
    gameId: gameId && gameId.length > 0 ? gameId : null,
    sort: one(params.sort) === "popular" ? "popular" : "newest",
    page: page && /^[1-9]\d*$/.test(page) ? Number(page) : 1,
  };
}

/** The /clips URL for a query; defaults are left out. */
export function clipsHref({ gameId, sort, page }: ClipQuery): string {
  const params = new URLSearchParams();
  if (gameId) params.set("game", gameId);
  if (sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/clips?${query}` : "/clips";
}

export const CLIP_SORT_LABELS: Record<ClipSort, string> = {
  newest: "最新上傳",
  popular: "熱門",
};

export const REPORT_CATEGORY_OPTIONS: {
  value: ReportCategory;
  label: string;
}[] = [
  { value: "inappropriate", label: "不當內容" },
  { value: "infringement", label: "侵權" },
  { value: "impersonation", label: "冒用他人" },
  { value: "off-topic", label: "與遊戲無關" },
  { value: "other", label: "其他" },
];

/** Why a feature cannot be used now, or null when it can. */
export function voteBlockedReason(access: ClipAccess): string | null {
  if (access === "paused") return "影片按讚目前暫停";
  if (access === "denied") return "目前的角色不能對影片按讚";
  return null;
}

export function reportBlockedReason(access: ClipAccess): string | null {
  if (access === "paused") return "影片檢舉目前暫停";
  if (access === "denied") return "目前的角色不能檢舉影片";
  return null;
}

/**
 * What pressing a vote button sends: the same vote again takes it back (null), the other one
 * switches straight to it.
 */
export function nextVote(
  current: ClipVote | null,
  pressed: ClipVote,
): ClipVote | null {
  return current === pressed ? null : pressed;
}
