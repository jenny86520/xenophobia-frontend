import Link from "next/link";
import type { ReactNode } from "react";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { PendingCount } from "@/components/brand/pending-count";
import { Heading } from "@/components/brand/typography";
import { cn } from "@/lib/utils";
import { MEMBER_TABS, memberTabHref, type MemberTab } from "@/utils/member-tabs";

/**
 * The member page's tabs. Each tab is a link to its own URL (?tab=), rendered on the server, so
 * switching works without JavaScript and a tab can be shared. Being links, they are a <nav> with
 * aria-current, not an ARIA tablist (which needs scripted arrow keys). The current tab is marked
 * by a rule under it and bolder text, not by colour alone.
 */
export function MemberTabs({
  current,
  counts = {},
}: {
  current: MemberTab;
  /** Items waiting in a tab (好友: requests and invites; 冰炫風: gifts, requests, new tokens); 0 shows nothing. */
  counts?: Partial<Record<MemberTab, number>>;
}) {
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
                  "-mb-px inline-flex items-center gap-2 border-b-2 py-3 text-body whitespace-nowrap",
                  "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active
                    ? "border-signal font-medium text-ink"
                    : "border-transparent text-ink-secondary hover:border-line-strong hover:text-ink",
                )}
              >
                <tab.icon aria-hidden="true" className="size-4 shrink-0" />
                {tab.label}
                <PendingCount count={counts[tab.value] ?? 0} />
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
  /** Shown in the left column under the heading (e.g. the scrim rating). */
  aside?: ReactNode;
  children: ReactNode;
};

/** A tab's content: eyebrow, heading and an optional aside on the left, the content on the right (stacked on phones). */
export function MemberTabPanel({ id, eyebrow, title, aside, children }: MemberTabPanelProps) {
  return (
    <section aria-labelledby={id}>
      <EditorialGrid className="gap-y-8">
        <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading level={2} id={id}>
            {title}
          </Heading>
          {aside}
        </div>
        <div className="col-span-4 flex flex-col gap-8 md:col-span-8 lg:col-span-8 lg:col-start-5">{children}</div>
      </EditorialGrid>
    </section>
  );
}

type MemberTabColumnsProps = {
  /** Id of the tab heading. */
  id: string;
  eyebrow: string;
  title: string;
  /** Beside the heading, e.g. the feature's 「怎麼玩？」 guide button. */
  titleAside?: ReactNode;
  /** The main (left) column. */
  main: ReactNode;
  /** The right column, divided by a rule from 1024px. */
  side: ReactNode;
};

/**
 * A tab with its heading on top and two columns below from 1024px (main 7, side 5); below that they
 * stack in that order. Used by the 好友 and 投稿影片 tabs.
 */
export function MemberTabColumns({ id, eyebrow, title, titleAside, main, side }: MemberTabColumnsProps) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-10 flex flex-col gap-4">
        <Eyebrow>{eyebrow}</Eyebrow>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Heading level={2} id={id}>
            {title}
          </Heading>
          {titleAside}
        </div>
      </div>
      <EditorialGrid className="gap-y-12">
        <div className="col-span-4 flex flex-col gap-8 md:col-span-8 lg:col-span-7">{main}</div>
        <div className="col-span-4 flex flex-col gap-10 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:border-l lg:border-line lg:pl-8">
          {side}
        </div>
      </EditorialGrid>
    </section>
  );
}
