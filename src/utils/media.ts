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
 * Privacy-enhanced YouTube embed URL. Autoplay is always muted (browsers only allow
 * muted autoplay). Returns null for anything that is not a plain video id.
 */
export function youtubeEmbedUrl(youtubeId: string, autoplay: boolean): string | null {
  if (!YOUTUBE_ID.test(youtubeId)) return null;
  const params = new URLSearchParams({ playsinline: "1", rel: "0" });
  if (autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
}
