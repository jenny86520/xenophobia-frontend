import type { CSSProperties, SVGProps } from "react";
import { cn } from "@/lib/utils";
import type { CosmeticParams } from "@/types/cosmetic";
import { skinVars } from "@/utils/cosmetics";

/** A cup a holder changed onto a token (spec member-cosmetics): its template and colours. */
export type CupLook = { template: string; params: CosmeticParams };

/** The cup body: the dipped front rim, down the tapered sides to the rounded base. */
const CUP_BODY = "M4.5 5Q12 10.5 19.5 5L17.6 19.6A1.5 1.5 0 0 1 16.1 21H7.9A1.5 1.5 0 0 1 6.4 19.6Z";
/** The crumb mound, closed along the rim. */
const CREAM =
  "M6.5 6.3c-.2-1.5 1-2.6 2.4-2.4.4-1.3 1.8-2 3.1-1.5 1.3-.5 2.7.2 3.1 1.5 1.4-.2 2.6.9 2.4 2.4Q12 9.8 6.5 6.3Z";
/** The wavy band between the two wave lines. */
const BAND = "M5.6 13C8 11.2 10 11.2 12 13s4 1.8 6.4 0L18 16.4c-2.1 1.8-4 1.8-5.9 0s-3.8-1.8-6.1 0Z";
/** Diagonal stripes, each from the left side up to the right side of the cup. */
const STRIPES = ["M5.3 11 19 9", "M5.7 14.5 18.5 12.5", "M6.2 18 18.1 16"];

/** Fill layers under the outline, coloured by CSS variables only; null for an unknown template. */
function CupFill({ look }: { look: CupLook }) {
  if (look.template === "cup.classic") {
    return (
      <g stroke="none">
        <path d={CUP_BODY} fill="var(--cup-body, none)" />
        <path d={BAND} fill="var(--cup-band, none)" />
        <path d={CREAM} fill="var(--cup-cream, none)" />
      </g>
    );
  }
  if (look.template === "cup.striped") {
    return (
      <g>
        <path d={CUP_BODY} fill="var(--cup-body, none)" stroke="none" />
        {STRIPES.map((d) => (
          <path key={d} d={d} stroke="var(--cup-stripe, currentColor)" strokeWidth={1.6} />
        ))}
        <path d={CREAM} fill="var(--cup-cream, none)" stroke="none" />
      </g>
    );
  }
  return null;
}

function cupStyle(look: CupLook | null | undefined): CSSProperties | undefined {
  if (!look) return undefined;
  const vars = skinVars(look.params, {
    "--cup-body": "cupColor",
    "--cup-cream": "creamColor",
    "--cup-band": "bandColor",
    "--cup-stripe": "stripeColor",
  });
  const line = skinVars(look.params, { color: "lineColor" });
  return { ...vars, ...line };
}

/**
 * The one icon for ice cream tokens wherever they appear (tab, rows, shop, record, friend page):
 * decorative, coloured by the text, never the only signal.
 *
 * Hand-drawn on lucide's grid (24 × 24, stroke 2, round joins) so it sits beside the other line icons:
 * a tapered paper cup with tall corners, a mound of cookie crumbs over the dipped front rim and the
 * wavy band across the cup, with two bits of confetti. No brand marks.
 *
 * With a `look` (a cup bought in the shop) fill layers sit under the same outline: the classic cup
 * colours its body, band and cream, the striped cup draws stripes instead of the band; the outline
 * takes the cup's line colour. Without one the icon is exactly the plain line drawing.
 */
export function IceCreamIcon({ className, look, ...props }: SVGProps<SVGSVGElement> & { look?: CupLook | null }) {
  const knownLook = look && (look.template === "cup.classic" || look.template === "cup.striped") ? look : null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-hidden="true"
      data-cup={knownLook?.template}
      style={cupStyle(knownLook)}
      className={cn("size-4 shrink-0", className)}
    >
      {knownLook && <CupFill look={knownLook} />}
      <path d="M4.5 5 6.4 19.6A1.5 1.5 0 0 0 7.9 21h8.2a1.5 1.5 0 0 0 1.5-1.4L19.5 5" />
      <path d="M4.5 5Q12 10.5 19.5 5" />
      <path d="M6.5 6.3c-.2-1.5 1-2.6 2.4-2.4.4-1.3 1.8-2 3.1-1.5 1.3-.5 2.7.2 3.1 1.5 1.4-.2 2.6.9 2.4 2.4" />
      {knownLook?.template !== "cup.striped" && <path d="M5.6 13C8 11.2 10 11.2 12 13s4 1.8 6.4 0" />}
      {knownLook?.template !== "cup.striped" && <path d="M6 16.4c2.3-1.8 4.2-1.8 6.1 0s3.8 1.8 5.9 0" />}
      <path d="M15.6 9.6h.01" />
      <path d="M9.2 18.4h.01" />
    </svg>
  );
}
