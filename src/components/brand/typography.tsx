import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DisplayProps = {
  children: ReactNode;
  className?: string;
  as?: "h1" | "p" | "span" | "div";
  id?: string;
};

/** Display: the wordmark / giant statement size (Geist, uppercase, tight). */
export function Display({ children, className, as: Tag = "p", id }: DisplayProps) {
  return (
    <Tag id={id} className={cn("font-sans text-display uppercase", className)}>
      {children}
    </Tag>
  );
}

const HEADING_SIZE = { 1: "text-h1", 2: "text-h2", 3: "text-h3" } as const;

type HeadingProps = {
  level: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Visual size when it should differ from the semantic level. */
  size?: 1 | 2 | 3;
};

/** H1–H3 on the type scale. Serif (Noto Serif TC) so Chinese headings read as editorial. */
export function Heading({ level, children, className, id, size }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={cn("font-heading text-balance", HEADING_SIZE[size ?? level], className)}>
      {children}
    </Tag>
  );
}
