import type { GameVideo } from "@/types/about";
import { ClipYouTube } from "./clip-youtube";
import { mediaUrl, youtubeEmbedUrl } from "@/utils/media";
import { videoTitle } from "@/utils/video-title";

/**
 * One clip's player on /clips. YouTube: a thumbnail and play button (`ClipYouTube`) that loads the
 * privacy-enhanced player only when pressed (a page holds a dozen, and many YouTube players from
 * one address make YouTube ask visitors to sign in); without JavaScript the old lazily loaded
 * player in <noscript>, laid over the thumbnail. Uploads: the native player, never autoplaying.
 */
export function ClipPlayer({ video }: { video: GameVideo }) {
  const label = videoTitle(video);
  const embed = video.source === "youtube" ? youtubeEmbedUrl(video.youtubeId, false) : null;
  return (
    <div className="relative aspect-video w-full overflow-clip rounded-sm bg-black">
      {video.source === "youtube" ? (
        embed && (
          <>
            <ClipYouTube youtubeId={video.youtubeId} label={label} />
            <noscript>
              <iframe
                src={embed}
                title={label}
                loading="lazy"
                allow="encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            </noscript>
          </>
        )
      ) : (
        <video
          className="absolute inset-0 size-full object-contain"
          aria-label={label}
          controls
          playsInline
          preload="metadata"
        >
          <source src={mediaUrl(video.url)} type={video.mimeType} />
        </video>
      )}
    </div>
  );
}
