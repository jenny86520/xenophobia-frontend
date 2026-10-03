import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** The single page container: 1440px max width with the fluid gutter (design §4). */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-page px-gutter", className)}>{children}</div>;
}
