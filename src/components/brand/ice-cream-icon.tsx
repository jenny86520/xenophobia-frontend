import { IceCreamCone } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one icon for ice cream tokens wherever they appear (tab, rows, shop, record, friend page):
 * decorative, coloured by the text, never the only signal.
 */
export function IceCreamIcon({ className }: { className?: string }) {
  return <IceCreamCone aria-hidden="true" className={cn("size-4 shrink-0", className)} />;
}
