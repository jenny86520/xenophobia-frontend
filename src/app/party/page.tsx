import type { Metadata } from "next";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { PartyFilters } from "@/components/party/party-filters";
import { PartyRow } from "@/components/party/party-row";
import { fetchPartyList } from "@/lib/public-content-client";
import { parsePartyFilters } from "@/utils/party-filters";

export const metadata: Metadata = {
  title: "Party",
  description: "依狀態、形式與類型瀏覽 XenoPhobiA 的社群活動。",
  openGraph: { title: "Party | XenoPhobiA", description: "依狀態、形式與類型瀏覽 XenoPhobiA 的社群活動。" },
};

/** Party index: filters live in the URL and results are rendered on the server. */
export default async function PartyPage({ searchParams }: PageProps<"/party">) {
  const filters = parsePartyFilters(await searchParams);
  const parties = await fetchPartyList(filters.status, filters.format, filters.category);

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader eyebrow="PARTY / INDEX" title="活動" description="依狀態、形式與類型瀏覽社群活動。" />
      </Section>

      <Section spacing="none" className="pb-section">
        <div className="border-y border-line py-6">
          <PartyFilters value={filters} />
        </div>

        <p className="mt-8" aria-live="polite">
          <MetaLabel>Results / {formatCount(parties.length)}</MetaLabel>
        </p>

        {parties.length === 0 ? (
          <p className="mt-6 border-t border-line pt-8 text-lead text-ink-secondary">
            沒有符合目前篩選條件的活動。
          </p>
        ) : (
          <ul className="mt-6 border-b border-line">
            {parties.map((party) => (
              <PartyRow key={party.id} party={party} showLifecycleBadge={true} metaFields="date-category" titleAs="h2" />
            ))}
          </ul>
        )}
      </Section>
    </main>
  );
}
