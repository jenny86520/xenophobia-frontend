import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount } from "@/components/brand/meta-label";
import { Placeholder } from "@/components/brand/placeholder";
import { Section } from "@/components/brand/section";
import { StatFigure } from "@/components/brand/stat-figure";
import type { TeamProfile } from "@/types/about";

type StatementProps = {
  profile: TeamProfile;
  /** Figures derived from real data only (spec: founded year, parties, games, milestones). */
  stats: { parties: number; games: number; milestones: number };
};

/** 2 · Statement: what do we believe? Manifesto, mission, and data-derived figures. */
export function Statement({ profile, stats }: StatementProps) {
  const paragraphs = profile.mission.split(/\n\s*\n/).filter(Boolean);

  return (
    <Section labelledBy="statement-title" ruled className="reveal" id="statement">
      <EditorialGrid className="gap-y-10">
        <Eyebrow index={1} className="col-span-4 md:col-span-8 lg:col-span-2">
          Who we are
        </Eyebrow>
        <div className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-3">
          {profile.brandStatement ? (
            <h2 id="statement-title" className="font-heading text-h1 text-balance text-ink">
              {profile.brandStatement}
            </h2>
          ) : (
            <>
              <h2 id="statement-title" className="sr-only">
                品牌宣言
              </h2>
              <Placeholder name="brand.statement" label="品牌宣言" className="min-h-40" />
            </>
          )}
        </div>

        <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-5 lg:col-start-3">
          {paragraphs.map((text, i) => (
            <p key={i} className="max-w-[65ch] text-body text-ink-secondary">
              {text}
            </p>
          ))}
        </div>

        <dl className="col-span-4 grid grid-cols-1 gap-x-6 gap-y-4 self-start md:col-span-8 md:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
          <StatFigure
            label="Est."
            value={profile.foundedYear ?? <Placeholder name="brand.founded-year" label="成立年份" inline />}
          />
          <StatFigure label="Parties" value={formatCount(stats.parties)} />
          <StatFigure label="Games" value={formatCount(stats.games)} />
          <StatFigure label="Milestones" value={formatCount(stats.milestones)} />
        </dl>
      </EditorialGrid>
    </Section>
  );
}
