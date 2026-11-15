import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { CosmeticLook } from "@/types/cosmetic";
import { choice, skinVars } from "@/utils/cosmetics";
import { mediaUrl } from "@/utils/media";

/** Classes and CSS variables for a row in the scrim room; nothing when the player wears no frame. */
export type FrameProps = {
  className?: string;
  style?: CSSProperties;
  "data-frame"?: string;
  "data-ornament"?: string;
};

const BORDER_STYLES = {
  solid: "border-2 border-solid",
  dashed: "border-2 border-dashed",
  double: "border-4 border-double",
} as const;

const PULSE_SPEEDS = { slow: "4s", medium: "2.5s" } as const;

const ORNAMENTS = ["bracket", "snowflake", "star"] as const;

/** The only image path a frame picture may have: an uploaded image the backend serves. */
const STORED_IMAGE_PATH = /^\/media\/images\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

/** `url("…")` of an image frame's picture, or null when the path is not a stored image. */
export function frameImageValue(imageUrl: string | null): string | null {
  if (!imageUrl || !STORED_IMAGE_PATH.test(imageUrl)) return null;
  return `url("${mediaUrl(imageUrl)}")`;
}

/**
 * A scrim-room frame (spec member-cosmetics): `frame.line` is a border in the main colour with an
 * optional static glow in the accent; `frame.pulse` breathes its glow between the two colours (the
 * `.frame-pulse` animation in globals.css, only without reduced motion, at least 2.5 s a cycle);
 * `frame.corners` puts an ornament in each corner (`.frame-corners`); `frame.image` draws the admins'
 * picture on the border only (`.frame-image`), a solid main-colour border when it does not load. The
 * frame is decoration only, so it never carries meaning.
 */
export function frameProps(look: CosmeticLook | null | undefined): FrameProps {
  if (!look) return {};
  const colors = skinVars(look.params, { "--skin-main": "mainColor", "--skin-accent": "accentColor" });
  if (look.template === "frame.line") {
    const border = BORDER_STYLES[choice(look.params.borderStyle, ["solid", "dashed", "double"] as const, "solid")];
    return {
      "data-frame": look.template,
      style: colors,
      className:
        `rounded-sm px-2 ${border} border-(--skin-main) ${look.params.glow === true ? "shadow-[0_0_12px_var(--skin-accent)]" : ""}`.trim(),
    };
  }
  if (look.template === "frame.pulse") {
    const speed = PULSE_SPEEDS[choice(look.params.speed, ["slow", "medium"] as const, "slow")];
    return {
      "data-frame": look.template,
      style: { ...colors, "--skin-speed": speed } as CSSProperties,
      className: "frame-pulse rounded-sm border-2 border-solid border-(--skin-main) px-2",
    };
  }
  if (look.template === "frame.corners") {
    return {
      "data-frame": look.template,
      "data-ornament": choice(look.params.ornament, ORNAMENTS, "bracket"),
      style: colors,
      className: "frame-corners rounded-sm px-2",
    };
  }
  if (look.template === "frame.image") {
    const image = frameImageValue(look.imageUrl);
    return {
      "data-frame": look.template,
      style: (image ? { ...colors, "--skin-frame-image": image } : colors) as CSSProperties,
      className: "frame-image px-2",
    };
  }
  return {};
}

/** Props for a scrim-room row: its own classes, plus the frame (spaced from its neighbours) when worn. */
export function frameRow(look: CosmeticLook | null | undefined, className: string): FrameProps {
  const frame = frameProps(look);
  return {
    "data-frame": frame["data-frame"],
    "data-ornament": frame["data-ornament"],
    style: frame.style,
    className: cn(className, frame.className && `my-1 ${frame.className}`),
  };
}
