import type { ReactNode } from "react";
import { MetaLabel } from "./meta-label";

type PageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

/**
 * Dark Editorial page opener: monospace eyebrow, large heading, short description.
 * The eyebrow's "/" separator is the only accent-colored part.
 */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  const [section, ...rest] = eyebrow.split(" / ");

  return (
    <header className="flex flex-col gap-4">
      <MetaLabel>
        {section}
        {rest.length > 0 && (
          <>
            <span className="text-primary"> / </span>
            {rest.join(" / ")}
          </>
        )}
      </MetaLabel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {description && <p className="max-w-prose leading-relaxed text-muted-foreground">{description}</p>}
    </header>
  );
}
