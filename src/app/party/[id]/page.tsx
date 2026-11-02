import { CalendarDays, Clock, History, Lock, MapPin, Tag, UserPen } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { MatchRow } from "@/components/match/match-row";
import { PartyRegistration } from "@/components/party/party-registration";
import { PartyStatusBadges } from "@/components/party/party-status-badges";
import { SubPartyList } from "@/components/party/sub-party-list";
import { fetchMemberRegistration } from "@/lib/member-session";
import { fetchMatches, fetchPartyDetail } from "@/lib/public-content-client";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/utils/media";
import { resolvePartyLifecycleStatus } from "@/utils/party-lifecycle";
import { UNDECIDED, formatPartyTimeOfDay } from "@/utils/party-time";

export async function generateMetadata({ params }: PageProps<"/party/[id]">): Promise<Metadata> {
  const { id } = await params;
  const party = await fetchPartyDetail(id).catch(() => null);
  if (!party) return { title: "找不到活動" };
  // Nothing about a members-only party leaves the backend for visitors, not even its title.
  if ("membersOnly" in party) return { title: "會員限定活動", robots: { index: false } };
  const description = party.summary || party.description;
  return {
    title: party.title,
    description,
    openGraph: { title: `${party.title} | XenoPhobiA`, description },
  };
}

/** What a visitor sees for a members-only party: the notice and a way to sign in, nothing else. */
function MembersOnlyNotice() {
  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <TextLink href="/party" lang="en" className="text-body text-ink-secondary hover:text-ink">
          <span aria-hidden="true">←</span> Back to Party
        </TextLink>
        <div className="mt-10 flex flex-col gap-6">
          <Eyebrow>PARTY / MEMBERS ONLY</Eyebrow>
          <Heading level={1} id="page-title" className="inline-flex items-center gap-3">
            <Lock aria-hidden="true" className="size-8 shrink-0 text-signal" />
            此活動僅限會員查看
          </Heading>
          <p className="max-w-[60ch] text-lead text-ink-secondary">
            這是只開放給會員的線下活動。登入會員後即可查看時間、地點與報名。
          </p>
          <p className="text-body">
            <TextLink href="/member/login">會員登入</TextLink>
          </p>
        </div>
      </Section>
    </main>
  );
}

/** Party detail: cover, oversized date, registration, metadata table, the sub-parties, then scrim matches. */
export default async function PartyDetailPage({ params }: PageProps<"/party/[id]">) {
  const { id } = await params;
  const party = await fetchPartyDetail(id);
  if (!party) notFound();
  if ("membersOnly" in party) return <MembersOnlyNotice />;
  // Signed-in members also get the participant list; visitors only the public count.
  const [memberRegistration, matches] = await Promise.all([
    party.registration ? fetchMemberRegistration(party.id) : null,
    fetchMatches(party.id),
  ]);

  const lifecycle = resolvePartyLifecycleStatus(party.status);
  const hasRegistration = Boolean(party.registration);
  const subParties = party.subParties ?? [];
  const details = [
    { label: "Location", icon: MapPin, value: party.location },
    {
      label: "Date",
      icon: CalendarDays,
      value: party.endDate && party.endDate !== party.startDate ? `${party.startDate} – ${party.endDate}` : party.startDate || UNDECIDED,
    },
    { label: "Time", icon: Clock, value: formatPartyTimeOfDay(party) || UNDECIDED },
    { label: "Type", icon: Tag, value: party.category },
    { label: "Created_by", icon: UserPen, value: party.createdBy },
    { label: "Updated_by", icon: History, value: party.updatedBy ?? "—" },
  ];

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <TextLink href="/party" lang="en" className="text-body text-ink-secondary hover:text-ink">
          <span aria-hidden="true">←</span> Back to Party
        </TextLink>
        {party.coverUrl && (
          // The frame clips the cover while it unveils and settles from 1.1x (.media-reveal).
          <div className="mt-8 overflow-clip rounded-sm border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- original upload on the backend origin */}
            <img
              src={mediaUrl(party.coverUrl)}
              alt={`${party.title} 封面`}
              fetchPriority="high"
              className="media-reveal aspect-video w-full object-cover"
            />
          </div>
        )}
        {/* Date | title and description | registration (third column when the party takes sign-ups). */}
        <EditorialGrid className="mt-10 gap-y-8">
          <div
            className={cn(
              "col-span-4 flex min-w-0 flex-col gap-2 md:col-span-3",
              hasRegistration ? "lg:col-span-3" : "lg:col-span-4",
            )}
          >
            <MetaLabel>{party.startDate ? party.startDate.slice(0, 4) : "Date"}</MetaLabel>
            {/* Sized to its column: with the registration column the date gets 3 of 12 columns, so the
                type is capped lower there (5 mono digits must fit without running into the title). */}
            <p
              className={cn(
                "font-mono leading-none font-medium tracking-tight whitespace-nowrap text-ink tabular-nums",
                hasRegistration
                  ? "text-[clamp(3rem,1rem+7vw,6rem)] lg:text-[clamp(3rem,0.5rem+4vw,5.5rem)]"
                  : "text-[clamp(3rem,1rem+7vw,8rem)]",
              )}
            >
              {party.startDate ? party.startDate.slice(5).replace("-", "/") : UNDECIDED}
            </p>
          </div>
          <header
            className={cn(
              "col-span-4 flex min-w-0 flex-col gap-6 md:col-span-5",
              hasRegistration ? "lg:col-span-5" : "lg:col-span-8",
            )}
          >
            <Eyebrow>PARTY / DETAIL</Eyebrow>
            <Heading level={1} id="page-title">
              {party.title}
            </Heading>
            <PartyStatusBadges format={party.format} lifecycle={lifecycle} isPublic={party.isPublic} />
            {party.description && (
              <p className="max-w-[60ch] text-lead whitespace-pre-line text-ink-secondary">{party.description}</p>
            )}
          </header>
          {party.registration && (
            <div className="col-span-4 md:col-span-8 lg:col-span-4">
              <PartyRegistration partyId={party.id} summary={party.registration} member={memberRegistration} />
            </div>
          )}
        </EditorialGrid>

        <dl className="mt-section-tight grid grid-cols-1 border-t border-line md:grid-cols-2 lg:grid-cols-3">
          {details.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
              <dt>
                <MetaLabel className="inline-flex items-center gap-1.5">
                  <item.icon aria-hidden="true" className="size-3.5 shrink-0" />
                  {item.label}
                </MetaLabel>
              </dt>
              <dd className="text-lead text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {subParties.length > 0 && (
        <Section labelledBy="sub-parties-title" ruled>
          <EditorialGrid className="gap-y-8">
            <div
              className={cn(
                "col-span-4 flex flex-col gap-4 md:col-span-8",
                hasRegistration ? "lg:col-span-12" : "lg:col-span-4",
              )}
            >
              <Eyebrow>{`Sub-parties / ${formatCount(subParties.length)}`}</Eyebrow>
              <Heading level={2} id="sub-parties-title">
                子派對
              </Heading>
            </div>
            {/* With registration each row has three columns, so the list takes the full width. */}
            <div
              className={cn(
                "col-span-4 md:col-span-8",
                hasRegistration ? "lg:col-span-12" : "lg:col-span-8 lg:col-start-5",
              )}
            >
              <SubPartyList
                subParties={subParties}
                registration={party.registration ? { partyId: party.id, member: memberRegistration } : undefined}
              />
            </div>
          </EditorialGrid>
        </Section>
      )}

      {matches.items.length > 0 && (
        <Section labelledBy="matches-title" ruled>
          <EditorialGrid className="gap-y-8">
            <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
              <Eyebrow>{`Matches / ${formatCount(matches.items.length)}`}</Eyebrow>
              <Heading level={2} id="matches-title">
                內戰場次
              </Heading>
            </div>
            <ul className="col-span-4 border-b border-line md:col-span-8 lg:col-span-8 lg:col-start-5">
              {matches.items.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </ul>
          </EditorialGrid>
        </Section>
      )}
    </main>
  );
}
