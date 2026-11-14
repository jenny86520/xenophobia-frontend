/**
 * Browser-facing URL of an uploaded file the backend serves (e.g. "/media/videos/<id>.mp4").
 * Uses NEXT_PUBLIC_BACKEND_URL, not BACKEND_URL: the server may reach the backend on an
 * internal address that visitors' browsers cannot.
 */
export function mediaUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Privacy-enhanced YouTube embed URL. Autoplay is muted unless `muted` is false (browsers only
 * allow muted autoplay on their own; unmuted works after the visitor pressed play on the page).
 * With `origin` (the page's own), the embed accepts the IFrame API (`enablejsapi`), which the
 * carousel uses to notice when a video ends. Returns null for anything that is not a plain video id.
 */
export function youtubeEmbedUrl(youtubeId: string, autoplay: boolean, origin?: string, muted = true): string | null {
  if (!YOUTUBE_ID.test(youtubeId)) return null;
  const params = new URLSearchParams({ playsinline: "1", rel: "0" });
  if (autoplay) {
    params.set("autoplay", "1");
    if (muted) params.set("mute", "1");
  }
  if (origin) {
    params.set("enablejsapi", "1");
    params.set("origin", origin);
  }
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
}

/**
 * A YouTube video's thumbnail (480x360, which every video has; the larger sizes are missing for
 * some videos and YouTube then answers with a grey placeholder instead of an error).
 * Returns null for anything that is not a plain video id.
 */
export function youtubeThumbnailUrl(youtubeId: string): string | null {
  return YOUTUBE_ID.test(youtubeId) ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null;
}
