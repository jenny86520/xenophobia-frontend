import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveTimeline } from "@/components/brand/archive-timeline";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { PartyStatusBadges } from "@/components/party/party-status-badges";
import { fetchPartyDetail } from "@/lib/public-content-client";
import { formatTimelineTime } from "@/utils/datetime";
import { resolvePartyLifecycleStatus } from "@/utils/party-lifecycle";

export async function generateMetadata({ params }: PageProps<"/party/[id]">): Promise<Metadata> {
  const { id } = await params;
  const party = await fetchPartyDetail(id).catch(() => null);
  if (!party) return { title: "找不到活動" };
  const description = party.summary || party.description;
  return {
    title: party.title,
    description,
    openGraph: { title: `${party.title} | XenoPhobiA`, description },
  };
}

/** Party detail: oversized date, metadata table, and the night's timeline. */
export default async function PartyDetailPage({ params }: PageProps<"/party/[id]">) {
  const { id } = await params;
  const party = await fetchPartyDetail(id);
  if (!party) notFound();

  const lifecycle = resolvePartyLifecycleStatus(party.status);
  const timeline = party.timeline ?? [];
  const details = [
    { label: "Location", value: party.location },
    { label: "Date", value: party.startDate },
    { label: "Time", value: party.startTime },
    { label: "Type", value: party.category },
    { label: "Created_by", value: party.createdBy },
    { label: "Updated_by", value: party.updatedBy ?? "—" },
  ];

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <TextLink href="/party" className="text-body text-ink-secondary hover:text-ink">
          ← 返回活動列表
        </TextLink>
        <EditorialGrid className="mt-10 gap-y-8">
          <div className="col-span-4 flex flex-col gap-2 md:col-span-3 lg:col-span-4">
            <MetaLabel>{party.startDate.slice(0, 4)}</MetaLabel>
            <p className="font-mono text-[clamp(3rem,1rem+7vw,8rem)] leading-none font-medium tracking-tight text-ink tabular-nums">
              {party.startDate.slice(5).replace("-", "/")}
            </p>
          </div>
          <header className="col-span-4 flex flex-col gap-6 md:col-span-5 lg:col-span-8">
            <Eyebrow>PARTY / DETAIL</Eyebrow>
            <Heading level={1} id="page-title">
              {party.title}
            </Heading>
            <PartyStatusBadges format={party.format} lifecycle={lifecycle} />
            {party.description && (
              <p className="max-w-[60ch] text-lead whitespace-pre-line text-ink-secondary">{party.description}</p>
            )}
          </header>
        </EditorialGrid>

        <dl className="mt-section-tight grid grid-cols-1 border-t border-line md:grid-cols-2 lg:grid-cols-3">
          {details.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
              <dt>
                <MetaLabel>{item.label}</MetaLabel>
              </dt>
              <dd className="text-lead text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {timeline.length > 0 && (
        <Section labelledBy="timeline-title" ruled>
          <EditorialGrid className="gap-y-8">
            <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
              <Eyebrow>{`Timeline / ${formatCount(timeline.length)}`}</Eyebrow>
              <Heading level={2} id="timeline-title">
                時間軸
              </Heading>
            </div>
            <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
              <ArchiveTimeline
                items={timeline.map((item) => ({
                  id: item.id,
                  marker: formatTimelineTime(item.startDateTime),
                  dateTime: item.startDateTime,
                  title: item.title,
                  description: item.description,
                }))}
              />
            </div>
          </EditorialGrid>
        </Section>
      )}
    </main>
  );
}
