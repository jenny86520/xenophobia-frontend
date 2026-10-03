import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

const SPACING = {
  default: "py-section",
  tight: "py-section-tight",
  loose: "py-section-loose",
  none: "",
} as const;

type SectionProps = {
  children: ReactNode;
  /** id of the heading that names this section (rendered as aria-labelledby). */
  labelledBy?: string;
  id?: string;
  spacing?: keyof typeof SPACING;
  /**
   * Full-bleed: the section's own background and decoration span the viewport and
   * children are rendered unwrapped (they place their own Container). Otherwise
   * children sit inside the page Container.
   */
  bleed?: boolean;
  /** Draw a thin rule above the section. */
  ruled?: boolean;
  className?: string;
};

/** A page section on the shared vertical rhythm (design §3.3). Pages never set their own section margins. */
export function Section({
  children,
  labelledBy,
  id,
  spacing = "default",
  bleed = false,
  ruled = false,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative", SPACING[spacing], ruled && "border-t border-line", className)}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
