import type { CoverUrl } from "@/types/party";
import { mediaUrl } from "@/utils/media";

type PartyCoverBackdropProps = {
  coverUrl: CoverUrl;
};

/**
 * A party's cover filling its (relative, isolated) container, behind the content.
 * The cover is decoration here, so it is hidden from assistive technology. A `background`
 * scrim (`.cover-scrim`, darker on the text-heavy left, lighter to the right) keeps every
 * text and badge above it at WCAG AA on any image. Renders nothing without a cover.
 */
export function PartyCoverBackdrop({ coverUrl }: PartyCoverBackdropProps) {
  if (!coverUrl) return null;
  return (
    <div aria-hidden="true" data-cover-backdrop className="pointer-events-none absolute inset-0 -z-10">
      {/* eslint-disable-next-line @next/next/no-img-element -- original upload on the backend origin; next/image would proxy it for no gain */}
      <img
        src={mediaUrl(coverUrl)}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
      <div data-cover-scrim className="cover-scrim absolute inset-0" />
    </div>
  );
}
