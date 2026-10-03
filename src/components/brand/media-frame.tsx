import Image from "next/image";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";

const RATIO = {
  "21/9": "aspect-[4/3] md:aspect-[21/9]",
  "16/9": "aspect-[16/9]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "3/2": "aspect-[3/2]",
} as const;

type MediaFrameProps = {
  ratio: keyof typeof RATIO;
  /** Image source; when absent the frame shows a placeholder of the same shape. */
  src?: string;
  alt: string;
  caption?: string;
  placeholderName: string;
  placeholderLabel: string;
  className?: string;
  sizes?: string;
};

/**
 * Fixed-ratio media slot (design §5): reserving the box up front means real images
 * added later cause no layout shift.
 */
export function MediaFrame({
  ratio,
  src,
  alt,
  caption,
  placeholderName,
  placeholderLabel,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: MediaFrameProps) {
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className={cn("media-frame relative overflow-hidden bg-surface", RATIO[ratio])}>
        {src ? (
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
        ) : (
          <Placeholder name={placeholderName} label={placeholderLabel} className="absolute inset-0" />
        )}
      </div>
      {caption && <figcaption className="text-caption text-ink-muted">{caption}</figcaption>}
    </figure>
  );
}
