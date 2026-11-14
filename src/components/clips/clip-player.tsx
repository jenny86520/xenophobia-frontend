import type { GameVideo } from "@/types/about";
import { mediaUrl, youtubeEmbedUrl } from "@/utils/media";
import { videoTitle } from "@/utils/video-title";

/**
 * One clip's player on /clips: YouTube through the privacy-enhanced embed, loaded lazily (a page
 * holds a dozen), uploads with the native player. Never autoplays.
 */
export function ClipPlayer({ video }: { video: GameVideo }) {
  const label = videoTitle(video);
  const embed =
    video.source === "youtube" ? youtubeEmbedUrl(video.youtubeId, false) : null;
  return (
    <div className="relative aspect-video w-full overflow-clip rounded-sm bg-black">
      {video.source === "youtube" ? (
        embed && (
          <iframe
            src={embed}
            title={label}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
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
