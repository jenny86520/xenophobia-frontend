"use client";

import type { LatestVideo } from "@/types/about";
import { mediaUrl, youtubeEmbedUrl } from "@/utils/media";

type GameHighlightPlayerProps = {
  gameName: string;
  video: LatestVideo;
  /** Muted autoplay; false when the visitor prefers reduced motion. */
  autoplay: boolean;
};

/**
 * The player for the carousel's current slide. Fills its 16:9 parent. Unmounting it
 * (moving to another slide) stops playback.
 */
export function GameHighlightPlayer({ gameName, video, autoplay }: GameHighlightPlayerProps) {
  const label = `${gameName} 最新 highlight：${video.title}`;

  if (video.source === "youtube") {
    const src = youtubeEmbedUrl(video.youtubeId, autoplay);
    if (!src) return null;
    return (
      <iframe
        src={src}
        title={label}
        className="absolute inset-0 size-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <video
      className="absolute inset-0 size-full bg-black object-contain"
      aria-label={label}
      controls
      muted
      playsInline
      autoPlay={autoplay}
      preload="metadata"
    >
      <source src={mediaUrl(video.url)} type={video.mimeType} />
    </video>
  );
}
