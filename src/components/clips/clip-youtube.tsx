"use client";

import { useState } from "react";
import { YouTubeFacade } from "@/components/video/youtube-facade";
import { youtubeEmbedUrl } from "@/utils/media";

/**
 * A YouTube clip on /clips: its thumbnail and a play button until the member presses play, then
 * the privacy-enhanced player, started with sound. Each clip decides on its own, so a page of
 * twelve never loads twelve YouTube players.
 */
export function ClipYouTube({ youtubeId, label }: { youtubeId: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = youtubeEmbedUrl(youtubeId, true, undefined, false);
  if (!embed) return null;
  if (!playing) {
    return <YouTubeFacade youtubeId={youtubeId} title={label} label={label} onPlay={() => setPlaying(true)} />;
  }
  return (
    <iframe
      src={embed}
      title={label}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className="absolute inset-0 size-full border-0"
    />
  );
}
