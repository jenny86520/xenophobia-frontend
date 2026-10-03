import type { ReactNode } from "react";
import { EditorialGrid } from "./editorial-grid";
import { Eyebrow } from "./eyebrow";
import { Heading } from "./typography";

type PageHeaderProps = {
  /** "PARTY / INDEX"-style eyebrow. */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

/**
 * Editorial page opener for inner pages: mono eyebrow, H1, then a description set
 * against the grid (heading spans 9 columns, description 6, offset on desktop).
 */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header>
      <EditorialGrid className="gap-y-6">
        <Eyebrow className="col-span-full">{eyebrow}</Eyebrow>
        <Heading level={1} id="page-title" className="col-span-full lg:col-span-9">
          {title}
        </Heading>
        {description &&
          (typeof description === "string" ? (
            <p className="col-span-full text-lead text-ink-secondary md:col-span-6 lg:col-start-4">{description}</p>
          ) : (
            <div className="col-span-full text-lead text-ink-secondary md:col-span-6 lg:col-start-4">{description}</div>
          ))}
        {actions && <div className="col-span-full flex flex-wrap items-center gap-6">{actions}</div>}
      </EditorialGrid>
    </header>
  );
}
