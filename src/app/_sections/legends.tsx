import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { MetaLabel } from "@/components/brand/meta-label";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { LegendPodium } from "@/components/legends/legend-podium";
import type { Legends as LegendsData } from "@/types/legends";

/** How many places of the overall ranking the home page shows; /legends has the rest. */
export const HOME_LEGEND_PLACES = 3;

/**
 * 3 · Legends (in place of the old gallery, right after the games): the top three of the overall ranking as a podium
 * of gold, silver and bronze trophies (LegendPodium), with a link to /legends. Places come from the backend, ties included.
 */
export function Legends({ legends }: { legends: LegendsData }) {
  const top = legends.overall.entries.filter((entry) => entry.rank <= HOME_LEGEND_PLACES);
  return (
    <Section labelledBy="legends-title" ruled className="reveal" id="legends">
      <EditorialGrid className="gap-y-8">
        <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
          <Eyebrow index={3}>Legends</Eyebrow>
          <Heading level={2} id="legends-title">
            傳奇榜
          </Heading>
          <TextLink href="/legends" lang="en" className="cta-secondary self-start text-body text-ink">
            All legends <span aria-hidden="true">→</span>
          </TextLink>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
          {top.length > 0 ? (
            <>
              <p className="mb-8">
                <MetaLabel>{legends.overall.title}</MetaLabel>
              </p>
              <LegendPodium title={legends.overall.title} entries={top} />
            </>
          ) : (
            <p className="border-t border-b border-line py-6 text-body text-ink-secondary">還沒有會員上榜</p>
          )}
        </div>
      </EditorialGrid>
    </Section>
  );
}
