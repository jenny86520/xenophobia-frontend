import type { CSSProperties } from "react";
import type { CosmeticParams } from "@/types/cosmetic";

/**
 * Presentation helpers for cosmetics (spec member-cosmetics). Colours come from the admins through
 * the backend, which already checked them; they only ever reach CSS as custom properties, and a value
 * that is not #rrggbb is dropped here too, so nothing else can slip into a style attribute.
 */

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function hexColor(value: unknown): string | null {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : null;
}

/** `{ "--skin-main": params.mainColor, … }` for the colours that are valid; others are left out. */
export function skinVars(params: CosmeticParams, map: Record<string, string>): CSSProperties {
  const style: Record<string, string> = {};
  for (const [variable, param] of Object.entries(map)) {
    const color = hexColor(params[param]);
    if (color) style[variable] = color;
  }
  return style as CSSProperties;
}

/** A choice param read only when it is one of the known values. */
export function choice<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Shop and collection wording per kind; the kind of a cup says it is used up on change. */
export const COSMETIC_KIND_LABELS: Record<string, string> = {
  title: "稱號",
  frame: "比賽室框",
  stamp: "集點卡外觀",
  cup: "冰炫風杯",
};

/** The condition line on a shop card, e.g. 「稱號・永久」「冰炫風杯・換一次」. */
export function cosmeticTerms(kind: string): string {
  const label = COSMETIC_KIND_LABELS[kind] ?? kind;
  return kind === "cup" ? `${label}・換一次` : `${label}・永久`;
}
