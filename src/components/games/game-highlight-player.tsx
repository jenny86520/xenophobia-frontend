"use client";

import { useEffect, useRef } from "react";
import { loadYouTubeApi } from "@/lib/youtube-iframe-api";
import type { GameVideo } from "@/types/about";
import { mediaUrl, youtubeEmbedUrl } from "@/utils/media";

type GameHighlightPlayerProps = {
  gameName: string;
  video: GameVideo;
  /** Muted autoplay; false when the visitor prefers reduced motion. */
  autoplay: boolean;
  /** Called when the video plays to its end (the carousel moves to the next one). */
  onEnded?: () => void;
};

/**
 * The player for the carousel's current video. Fills its 16:9 parent. The carousel keys it by
 * video id, so switching videos (or panels) unmounts it, which stops playback.
 */
export function GameHighlightPlayer({ gameName, video, autoplay, onEnded }: GameHighlightPlayerProps) {
  const label = `${gameName} highlight：${video.title}`;
  // Latest callback without re-attaching the YouTube listener on every render.
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  if (video.source === "youtube") {
    return (
      <YouTubeEmbed
        youtubeId={video.youtubeId}
        label={label}
        autoplay={autoplay}
        onEnded={() => onEndedRef.current?.()}
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
      onEnded={() => onEndedRef.current?.()}
    >
      <source src={mediaUrl(video.url)} type={video.mimeType} />
    </video>
  );
}

/**
 * Our own youtube-nocookie iframe (its src, title and domain unchanged), watched through the
 * IFrame API so the carousel knows when the video ends. If the API cannot load, the video still
 * plays; it just does not advance by itself.
 */
function YouTubeEmbed({
  youtubeId,
  label,
  autoplay,
  onEnded,
}: {
  youtubeId: string;
  label: string;
  autoplay: boolean;
  onEnded: () => void;
}) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  useEffect(() => {
    // React owns the iframe and removes it on unmount, so the API player is not destroyed
    // (that would remove the node a second time); events after cleanup are ignored instead.
    let active = true;
    loadYouTubeApi()
      .then((YT) => {
        if (!active || !iframe.current) return;
        new YT.Player(iframe.current, {
          events: {
            onStateChange: (event) => {
              if (active && event.data === YT.PlayerState.ENDED) onEndedRef.current();
            },
          },
        });
      })
      .catch(() => {
        // Blocked or offline: manual switching still works.
      });
    return () => {
      active = false;
    };
  }, [youtubeId]);

  // The player only mounts after hydration, so window is available here.
  const src = youtubeEmbedUrl(youtubeId, autoplay, window.location.origin);
  if (!src) return null;
  return (
    <iframe
      ref={iframe}
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
