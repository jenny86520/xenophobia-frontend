import Link from "next/link";
import type { ReactNode } from "react";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Heading } from "@/components/brand/typography";
import { cn } from "@/lib/utils";
import { MEMBER_TABS, memberTabHref, type MemberTab } from "@/utils/member-tabs";

/**
 * The member page's tabs. Each tab is a link to its own URL (?tab=), rendered on the server, so
 * switching works without JavaScript and a tab can be shared. Being links, they are a <nav> with
 * aria-current, not an ARIA tablist (which needs scripted arrow keys). The current tab is marked
 * by a rule under it and bolder text, not by colour alone.
 */
export function MemberTabs({ current }: { current: MemberTab }) {
  return (
    <nav aria-label="會員專區" className="mb-section-tight">
      <ul className="flex flex-wrap gap-x-8 border-b border-line">
        {MEMBER_TABS.map((tab) => {
          const active = tab.value === current;
          return (
            <li key={tab.value} className="shrink-0">
              <Link
                href={memberTabHref(tab.value)}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 py-3 text-body whitespace-nowrap",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active
                    ? "border-signal font-medium text-ink"
                    : "border-transparent text-ink-secondary hover:border-line-strong hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type MemberTabPanelProps = {
  /** Id of the panel heading. */
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

/** A tab's content: eyebrow and heading on the left, the content on the right (stacked on phones). */
export function MemberTabPanel({ id, eyebrow, title, children }: MemberTabPanelProps) {
  return (
    <section aria-labelledby={id}>
      <EditorialGrid className="gap-y-8">
        <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading level={2} id={id}>
            {title}
          </Heading>
        </div>
        <div className="col-span-4 flex flex-col gap-8 md:col-span-8 lg:col-span-8 lg:col-start-5">{children}</div>
      </EditorialGrid>
    </section>
  );
}
