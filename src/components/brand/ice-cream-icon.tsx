import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The one icon for ice cream tokens wherever they appear (tab, rows, shop, record, friend page):
 * decorative, coloured by the text, never the only signal.
 *
 * Hand-drawn on lucide's grid (24 × 24, stroke 2, round joins) so it sits beside the other line icons:
 * a tapered paper cup with tall corners, a mound of cookie crumbs over the dipped front rim and the
 * wavy band across the cup, with two bits of confetti. No brand marks.
 */
export function IceCreamIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      className={cn("size-4 shrink-0", className)}
    >
      <path d="M4.5 5 6.4 19.6A1.5 1.5 0 0 0 7.9 21h8.2a1.5 1.5 0 0 0 1.5-1.4L19.5 5" />
      <path d="M4.5 5Q12 10.5 19.5 5" />
      <path d="M6.5 6.3c-.2-1.5 1-2.6 2.4-2.4.4-1.3 1.8-2 3.1-1.5 1.3-.5 2.7.2 3.1 1.5 1.4-.2 2.6.9 2.4 2.4" />
      <path d="M5.6 13C8 11.2 10 11.2 12 13s4 1.8 6.4 0" />
      <path d="M6 16.4c2.3-1.8 4.2-1.8 6.1 0s3.8 1.8 5.9 0" />
      <path d="M15.6 9.6h.01" />
      <path d="M9.2 18.4h.01" />
    </svg>
  );
}
