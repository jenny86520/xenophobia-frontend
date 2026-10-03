import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EditorialGridProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ol" | "ul" | "dl";
};

/**
 * The editorial grid: 4 columns on mobile, 8 from 768px, 12 from 1024px (design §4).
 * Children place themselves with col-span-* / col-start-* (e.g. "col-span-4 lg:col-span-7").
 */
export function EditorialGrid({ children, className, as: Tag = "div" }: EditorialGridProps) {
  return (
    <Tag className={cn("grid grid-cols-4 gap-x-4 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12", className)}>
      {children}
    </Tag>
  );
}
