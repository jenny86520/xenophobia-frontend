import type { Metadata } from "next";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { MetaLabel } from "@/components/brand/meta-label";
import { IceCreamDetailCard, IceCreamGrid } from "@/components/ice-cream/ice-cream-card";
import { IceCreamMembersOnly } from "@/components/ice-cream/members-only-notice";
import { fetchIceCreamAlbum } from "@/lib/member-session";

export const metadata: Metadata = {
  title: "Ice cream",
  description: "XenoPhobiA 冰炫風成長史冊：每支冰炫風從建立到功成身退的經過。",
  robots: { index: false },
};

/** The growth record as an album of tokens, newest first; members only (the backend refuses others). */
export default async function IceCreamsPage({ searchParams }: PageProps<"/ice-creams">) {
  const query = await searchParams;
  const page = typeof query.page === "string" && /^[1-9]\d*$/.test(query.page) ? Number(query.page) : 1;
  const album = await fetchIceCreamAlbum(page);
  if (!album) return <IceCreamMembersOnly />;

  const pages = Math.ceil(album.total / album.pageSize);
  const href = (target: number) => (target === 1 ? "/ice-creams" : `/ice-creams?page=${target}`);
  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="ICE CREAM / RECORD"
          title="冰炫風成長史冊"
          description="每支冰炫風從建立、贈送、退回到兌換的經過，都記在這裡。點一支冰炫風就能看它的一生。只有會員看得到，只顯示暱稱。"
          actions={<TextLink href="/member?tab=ice-creams">我的冰炫風</TextLink>}
        />
      </Section>
      <Section spacing="tight">
        {album.total === 0 ? (
          <p className="text-body text-ink-secondary">還沒有任何冰炫風。</p>
        ) : (
          <IceCreamGrid label="冰炫風成長史冊">
            {album.items.map((history) => (
              <IceCreamDetailCard key={history.iceCream.id} history={history} />
            ))}
          </IceCreamGrid>
        )}
        {pages > 1 && (
          <nav aria-label="成長史冊分頁" className="mt-6 flex items-center justify-between gap-4 text-body">
            {page > 1 ? <TextLink href={href(page - 1)}>較新的冰炫風</TextLink> : <span />}
            <MetaLabel>
              {page} / {pages}
            </MetaLabel>
            {page < pages ? <TextLink href={href(page + 1)}>較早的冰炫風</TextLink> : <span />}
          </nav>
        )}
      </Section>
    </main>
  );
}
