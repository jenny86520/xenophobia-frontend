/** The part of the YouTube IFrame Player API this site uses. */
export type YouTubeApi = {
  Player: new (
    element: HTMLIFrameElement,
    options: { events?: { onStateChange?: (event: { data: number }) => void } },
  ) => unknown;
  PlayerState: { ENDED: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YOUTUBE_IFRAME_API_URL = "https://www.youtube.com/iframe_api";

let pending: Promise<YouTubeApi> | null = null;

/**
 * Loads the YouTube IFrame Player API once per page (only called when an expanded game panel
 * shows a YouTube video). It is only used to notice when a video ends; the embed itself stays
 * on youtube-nocookie.com, and the video plays even when this script is blocked.
 */
export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise<YouTubeApi>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API_URL;
    script.async = true;
    script.onerror = () => {
      // Allow a later attempt (e.g. after a network hiccup).
      pending = null;
      reject(new Error("YouTube IFrame API failed to load"));
    };
    document.head.appendChild(script);
  });
  return pending;
}

/** Test hook: forget a pending load. */
export function resetYouTubeApiForTests() {
  pending = null;
}
