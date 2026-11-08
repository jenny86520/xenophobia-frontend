import { Store } from "lucide-react";
import { InfoDialog } from "@/components/brand/info-dialog";
import { MetaLabel } from "@/components/brand/meta-label";
import { GuideButton } from "@/components/guide/guide-button";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import type { Guide } from "@/types/guide";
import type { MemberPoints, PointCampaignProgress } from "@/types/member";
import { formatTaipeiDateTime } from "@/utils/datetime";
import { pointsTabHref } from "@/utils/member-tabs";
import { formatPointAmount, pointKindLabel } from "@/utils/point-kinds";
import { CheckInPanel } from "./check-in-panel";
import { MemberTabColumns } from "./member-tabs";
import { StampCard } from "./stamp-card";

/** The running campaign: name and end, the rules behind an ⓘ, and the stamp card. */
function CampaignCard({
  campaign,
  checkedInToday,
  requestedCard,
  ledgerPage,
}: {
  campaign: PointCampaignProgress;
  checkedInToday: boolean;
  requestedCard?: number;
  ledgerPage: number;
}) {
  return (
    <section aria-labelledby="campaign-title" className="flex flex-col gap-4 border-t border-line pt-8">
      <MetaLabel>簽到活動・{campaign.endDate.replaceAll("-", "/")} 結束</MetaLabel>
      <div className="flex items-center gap-2">
        <Heading level={3} id="campaign-title">
          {campaign.title}
        </Heading>
        <InfoDialog id="campaign-rules" title="簽到規則">
          <p>每天（台灣時間）可以簽到一次，每次獲得 1 點。</p>
          <p>
            活動期間連續簽到滿 {campaign.requiredDays} 天，另外獲得 1 點，然後重新計算；漏簽一天也會重新計算。
          </p>
        </InfoDialog>
      </div>
      <StampCard
        streak={campaign.streak}
        requiredDays={campaign.requiredDays}
        checkedInToday={checkedInToday}
        requestedCard={requestedCard}
        ledgerPage={ledgerPage}
      />
    </section>
  );
}

/** Links to the newer and older pages of entries (?tab=points&page=N), keeping the stamp card's ?card=. */
function EntryPages({ page, pageSize, total, card }: MemberPoints["entries"] & { card?: number }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const href = (target: number) => pointsTabHref({ page: target, card });
  return (
    <nav aria-label="點數紀錄分頁" className="flex items-center justify-between gap-4 text-body">
      {page > 1 ? <TextLink href={href(page - 1)}>較新的紀錄</TextLink> : <span />}
      <MetaLabel>
        {page} / {pages}
      </MetaLabel>
      {page < pages ? <TextLink href={href(page + 1)}>較早的紀錄</TextLink> : <span />}
    </nav>
  );
}

/**
 * The 點數 tab: the balance with today's check-in and the running campaign's stamp card on the left,
 * the member's ledger (newest first) on the right. Every number comes from the backend.
 */
export function MemberPointsPanel({
  points,
  guide = null,
  card,
}: {
  points: MemberPoints;
  guide?: Guide | null;
  /** `?card=` for a long campaign's stamp card. */
  card?: number;
}) {
  const { entries } = points;
  return (
    <MemberTabColumns
      id="points-title"
      eyebrow="Points"
      title="點數"
      titleAside={<GuideButton guide={guide} />}
      main={
        <>
          <CheckInPanel
            checkedInToday={points.checkedInToday}
            balance={
              <div className="flex flex-col gap-1">
                <MetaLabel>目前點數</MetaLabel>
                <p className="font-mono text-h1 text-ink">
                  {points.balance}
                  <span className="ml-2 font-sans text-lead text-ink-secondary">點</span>
                </p>
              </div>
            }
            campaign={
              points.campaign && (
                <CampaignCard
                  campaign={points.campaign}
                  checkedInToday={points.checkedInToday}
                  requestedCard={card}
                  ledgerPage={entries.page}
                />
              )
            }
          />
          <p className="text-body">
            <TextLink href="/shop" icon={Store}>
              點數商店
            </TextLink>
          </p>
        </>
      }
      side={
        <section aria-labelledby="point-entries-title" className="flex flex-col gap-4">
          <Heading level={3} id="point-entries-title">
            點數紀錄
          </Heading>
          {entries.total === 0 ? (
            <p className="text-body text-ink-secondary">還沒有點數紀錄，簽到就能拿到第一點。</p>
          ) : (
            <ol className="border-t border-line">
              {entries.items.map((entry) => (
                <li key={entry.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-body text-ink">{pointKindLabel(entry.kind)}</span>
                    <MetaLabel>{formatTaipeiDateTime(entry.createdAt)}</MetaLabel>
                  </div>
                  <span className="font-mono text-lead text-ink">{formatPointAmount(entry.amount)}</span>
                </li>
              ))}
            </ol>
          )}
          <EntryPages {...entries} card={card} />
        </section>
      }
    />
  );
}
