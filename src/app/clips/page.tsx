import type { Metadata } from "next";
import { CtaLink } from "@/components/brand/cta-link";
import { MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { ClipPlayer } from "@/components/clips/clip-player";
import { ClipVoteForm } from "@/components/clips/clip-vote-form";
import { ReportClipDialog } from "@/components/clips/report-clip-dialog";
import { reportClipAction, voteClipAction } from "@/app/member/actions";
import { fetchClips } from "@/lib/member-session";
import { cn } from "@/lib/utils";
import type { ClipSort } from "@/types/clip";
import {
  CLIP_SORT_LABELS,
  clipsHref,
  parseClipQuery,
  reportBlockedReason,
  voteBlockedReason,
} from "@/utils/clips";
import { videoTitle } from "@/utils/video-title";

export const metadata: Metadata = {
  title: "Clips",
  description: "XenoPhobiA 會員的精彩片段：按讚決定首頁播哪幾支。",
  robots: { index: false },
};

const SORTS: ClipSort[] = ["newest", "popular"];

/** What a visitor (or a refused token) sees: what this is and a way in, never a video. */
function ClipsMembersOnly() {
  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="CLIPS / MEMBERS"
          title="精彩片段"
          description="會員專屬：在這裡看大家的精彩片段，按讚決定每個遊戲在首頁播哪五支。登入會員後即可觀看。"
          actions={<CtaLink href="/member/login" label="會員登入" />}
        />
      </Section>
    </main>
  );
}

/**
 * /clips (spec video-clips 「精彩片段頁」): every listed video for members, filtered by game and sorted
 * by upload time or popularity through links (state in the URL), so it works without JavaScript.
 * Likes, dislikes and reports go through Server Actions bound here; the backend decides everything.
 * A grid of video cards, a deliberate exception to the hairline-row lists.
 */
export default async function ClipsPage({ searchParams }: PageProps<"/clips">) {
  const query = parseClipQuery(await searchParams);
  const list = await fetchClips(query);
  if (!list) return <ClipsMembersOnly />;

  const pages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const voteBlocked = voteBlockedReason(list.voting);
  const reportBlocked = reportBlockedReason(list.reporting);
  const filters = [{ id: null, name: "全部" }, ...list.games];

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="CLIPS / MEMBERS"
          title="精彩片段"
          description="大家的精彩片段都在這裡。每個遊戲最近一個月讚數最多的影片會上首頁，不夠五支時由歷來讚數最多的補上。按爛只是好玩，不影響排名。"
          actions={<TextLink href="/member?tab=videos">投稿影片</TextLink>}
        />
      </Section>
      <Section spacing="tight">
        <div className="flex flex-col gap-4 border-b border-line pb-4">
          <nav aria-label="遊戲篩選" className="flex flex-wrap gap-x-6 gap-y-2">
            {filters.map((game) => {
              const current = game.id === query.gameId;
              return (
                <TextLink
                  key={game.id ?? "all"}
                  href={clipsHref({ ...query, gameId: game.id, page: 1 })}
                  current={current}
                  className={cn(
                    "text-body",
                    current ? "text-ink" : "text-ink-secondary hover:text-ink",
                  )}
                >
                  {game.name}
                </TextLink>
              );
            })}
          </nav>
          <nav aria-label="排序" className="flex flex-wrap gap-x-6 gap-y-2">
            {SORTS.map((sort) => {
              const current = sort === query.sort;
              return (
                <TextLink
                  key={sort}
                  href={clipsHref({ ...query, sort, page: 1 })}
                  current={current}
                  className={cn(
                    "text-caption",
                    current ? "text-ink" : "text-ink-secondary hover:text-ink",
                  )}
                >
                  {CLIP_SORT_LABELS[sort]}
                </TextLink>
              );
            })}
          </nav>
        </div>
        {(voteBlocked || reportBlocked) && (
          <p
            role="note"
            className="mt-4 border-l-2 border-line-strong pl-3 text-caption text-ink-secondary"
          >
            {[voteBlocked, reportBlocked].filter(Boolean).join("；")}
          </p>
        )}
        {list.items.length === 0 ? (
          <p className="mt-8 text-body text-ink-secondary">還沒有影片。</p>
        ) : (
          <ul
            aria-label="精彩片段"
            className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3"
          >
            {list.items.map((clip) => (
              <li key={clip.id} className="flex flex-col gap-3">
                <ClipPlayer video={clip} />
                <div className="flex flex-col gap-1">
                  <MetaLabel>
                    {clip.game.name}・{clip.recordedOn}
                  </MetaLabel>
                  <h2 className="font-heading text-h3 text-ink">
                    {videoTitle(clip)}
                  </h2>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <ClipVoteForm
                    vote={voteClipAction.bind(null, clip.id)}
                    likes={clip.likes}
                    dislikes={clip.dislikes}
                    myVote={clip.myVote}
                    disabled={voteBlocked !== null}
                  />
                  <ReportClipDialog
                    report={reportClipAction.bind(null, clip.id)}
                    videoId={clip.id}
                    title={videoTitle(clip)}
                    reported={clip.reported}
                    canReport={clip.canReport}
                    disabledReason={reportBlocked}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && (
          <nav
            aria-label="精彩片段分頁"
            className="mt-10 flex items-center justify-between gap-4 text-body"
          >
            {query.page > 1 ? (
              <TextLink href={clipsHref({ ...query, page: query.page - 1 })}>
                上一頁
              </TextLink>
            ) : (
              <span />
            )}
            <MetaLabel>
              {query.page} / {pages}
            </MetaLabel>
            {query.page < pages ? (
              <TextLink href={clipsHref({ ...query, page: query.page + 1 })}>
                下一頁
              </TextLink>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Section>
    </main>
  );
}
