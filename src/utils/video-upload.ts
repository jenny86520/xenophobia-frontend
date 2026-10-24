/** The backend's upload limits, checked here only so a member is told before a long upload. */
export const MAX_VIDEO_UPLOAD_BYTES = 500 * 1024 * 1024;

const VIDEO_EXTENSIONS = [".mp4", ".webm"];

/** What the file input offers; the backend checks the type and content again. */
export const VIDEO_ACCEPT = ".mp4,.webm,video/mp4,video/webm";

/** Why a chosen file cannot be uploaded, or null when it may be. */
export function videoFileProblem(file: { name: string; size: number }): string | null {
  const name = file.name.toLowerCase();
  if (!VIDEO_EXTENSIONS.some((extension) => name.endsWith(extension))) return "只能上傳 MP4 或 WebM 影片";
  if (file.size > MAX_VIDEO_UPLOAD_BYTES) return "檔案不可超過 500 MB";
  if (file.size === 0) return "這個檔案是空的";
  return null;
}

/** The game menu's 其他 option: the member types the game's name instead. */
export const OTHER_GAME = "other";

/**
 * The game part of a submission as the backend expects it: a listed game's `gameId`, or for 其他
 * the typed `otherGameName` (sent even when empty, so the backend reports that field).
 */
export function submissionGame(gameId: string, otherGameName: string): { gameId: string } | { otherGameName: string } {
  return gameId === OTHER_GAME ? { otherGameName } : { gameId };
}

/** How a submission's game reads: the game's name, or 其他 with the name the member typed. */
export function submissionGameLabel(game: { name: string } | null, otherGameName: string): string {
  if (game) return game.name;
  return otherGameName ? `其他：${otherGameName}` : "其他";
}
