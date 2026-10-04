import { ArchiveTimeline } from "@/components/brand/archive-timeline";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Placeholder } from "@/components/brand/placeholder";
import { Section } from "@/components/brand/section";
import { Heading } from "@/components/brand/typography";
import type { Milestone } from "@/types/about";

type ArchiveProps = {
  milestones: Milestone[];
  index: number;
  /**
   * "split": heading in 4 columns (sticky from lg, like the games heading), timeline in 8 (home). "stacked": heading above a
   * full-width timeline, used on /about to break up neighbouring split sections.
   */
  layout?: "split" | "stacked";
};

/** 5 · Archive: the team's history as oversized years on a hairline. */
export function Archive({ milestones, index, layout = "split" }: ArchiveProps) {
  const stacked = layout === "stacked";
  return (
    <Section labelledBy="archive-title" ruled className="reveal" id="archive">
      <EditorialGrid className="gap-y-8">
        <div className={stacked ? "col-span-full flex flex-col gap-4 border-b border-line pb-8" : "col-span-4 flex flex-col gap-4 md:col-span-8 lg:sticky lg:top-8 lg:col-span-4 lg:self-start"}>
          <Eyebrow index={index}>Archive</Eyebrow>
          <Heading level={2} id="archive-title">
            里程碑
          </Heading>
        </div>
        <div className={stacked ? "col-span-full" : "col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5"}>
          {milestones.length > 0 ? (
            <ArchiveTimeline
              items={milestones.map((m) => ({
                id: m.id,
                marker: m.date,
                dateTime: /^\d{4}(-\d{2}){0,2}$/.test(m.date) ? m.date : undefined,
                title: m.title,
                description: m.description,
              }))}
            />
          ) : (
            <Placeholder name="milestones" label="里程碑" className="min-h-32" />
          )}
        </div>
      </EditorialGrid>
    </Section>
  );
}
