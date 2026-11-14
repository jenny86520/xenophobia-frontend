"use client";

import { useEffect, useRef, useState } from "react";
import { loadYouTubeApi } from "@/lib/youtube-iframe-api";
import type { GameVideo } from "@/types/about";
import { YouTubeFacade } from "@/components/video/youtube-facade";
import { mediaUrl, youtubeEmbedUrl } from "@/utils/media";
import { videoTitle } from "@/utils/video-title";

type GameHighlightPlayerProps = {
  gameName: string;
  video: GameVideo;
  /** Muted autoplay; false when the visitor prefers reduced motion. */
  autoplay: boolean;
  /**
   * The visitor already pressed play in this game: a YouTube video loads its player at once.
   * Until then a YouTube video only shows its thumbnail and a play button, so the page loads no
   * YouTube player (many embeds from one address make YouTube ask visitors to sign in).
   */
  youtubeOptIn: boolean;
  /** Called when the visitor presses a YouTube video's play button. */
  onRequestPlay?: () => void;
  /** Called when the video plays to its end (the carousel moves to the next one). */
  onEnded?: () => void;
};

/**
 * The player for the carousel's current video. Fills its 16:9 parent. The carousel keys it by
 * video id, so switching videos (or panels) unmounts it, which stops playback.
 */
export function GameHighlightPlayer({
  gameName,
  video,
  autoplay,
  youtubeOptIn,
  onRequestPlay,
  onEnded,
}: GameHighlightPlayerProps) {
  const label = `${gameName} highlight：${videoTitle(video)}`;
  // Pressed play on this very video: it starts playing even with reduced motion.
  const [requested, setRequested] = useState(false);
  // Latest callback without re-attaching the YouTube listener on every render.
  const onEndedRef = useRef(onEnded);
  useEffect(() => {
    onEndedRef.current = onEnded;
  });

  if (video.source === "youtube") {
    if (!youtubeOptIn && !requested) {
      return (
        <YouTubeFacade
          youtubeId={video.youtubeId}
          title={videoTitle(video)}
          label={label}
          onPlay={() => {
            setRequested(true);
            onRequestPlay?.();
          }}
        />
      );
    }
    return (
      <YouTubeEmbed
        youtubeId={video.youtubeId}
        label={label}
        autoplay={requested || autoplay}
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
  // Only reached after the visitor pressed play in this game, so autoplay may have sound.
  const src = youtubeEmbedUrl(youtubeId, autoplay, window.location.origin, false);
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
