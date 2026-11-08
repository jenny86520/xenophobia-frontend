import type { Guide } from "@/types/guide";
import { mediaUrl, youtubeEmbedUrl } from "@/utils/media";

/**
 * A guide's image and video, on its page and in its dialog. YouTube is the privacy-enhanced embed,
 * loaded lazily (a closed dialog does not fetch it); uploads use the native player with controls,
 * never autoplaying. Renders nothing when the guide has neither.
 */
export function GuideMedia({ guide }: { guide: Guide }) {
  const { video } = guide;
  const embed = video?.source === "youtube" ? youtubeEmbedUrl(video.youtubeId, false) : null;
  if (!guide.imageUrl && !video) return null;
  return (
    <div className="flex flex-col gap-4">
      {video && (
        <div className="relative aspect-video w-full overflow-clip rounded-sm bg-black">
          {embed ? (
            <iframe
              src={embed}
              title={`${guide.title}教學影片`}
              loading="lazy"
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          ) : video.source === "upload" ? (
            <video
              className="absolute inset-0 size-full object-contain"
              aria-label={`${guide.title}教學影片`}
              controls
              playsInline
              preload="metadata"
            >
              <source src={mediaUrl(video.url)} type={video.mimeType} />
            </video>
          ) : null}
        </div>
      )}
      {guide.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- backend media, like party covers
        <img src={mediaUrl(guide.imageUrl)} alt={guide.imageAlt} className="w-full rounded-sm" />
      )}
    </div>
  );
}
