"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { youtubeThumbnailUrl } from "@/utils/media";

/**
 * A YouTube video before the visitor asks for it: the thumbnail (decorative) under one play
 * button. Nothing from YouTube but the image loads; the title stands in when the image fails.
 * Used by the home games carousel and /clips: loading many YouTube players from one address makes
 * YouTube ask visitors to sign in, so a player only loads once someone presses play.
 */
export function YouTubeFacade({
  youtubeId,
  title,
  label,
  onPlay,
}: {
  youtubeId: string;
  title: string;
  label: string;
  onPlay: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const thumbnail = youtubeThumbnailUrl(youtubeId);
  return (
    <div className="absolute inset-0 bg-surface" data-youtube-facade>
      {thumbnail && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- a third-party thumbnail, like covers a plain <img>
        <img
          src={thumbnail}
          alt=""
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-end border border-line p-5">
          <span className="text-body text-ink">{title}</span>
        </div>
      )}
      <button
        type="button"
        aria-label={`播放：${label}`}
        className="group absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-4"
        onClick={onPlay}
      >
        <span className="inline-flex size-16 items-center justify-center rounded-sm bg-cta text-cta-ink transition-shadow group-hover:shadow-glow group-focus-visible:shadow-glow">
          <Play aria-hidden className="size-7 translate-x-0.5" fill="currentColor" />
        </span>
      </button>
    </div>
  );
}
