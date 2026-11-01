import { InfoDialog } from "@/components/brand/info-dialog";
import { formatCount } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import type { MemberVideoSubmissions } from "@/types/member";
import { MemberTabColumns } from "./member-tabs";
import { VideoSubmissionForms } from "./video-submission-forms";
import { VideoSubmissionList } from "./video-submission-list";

type MemberVideosPanelProps = {
  submissions: MemberVideoSubmissions;
  /** The games a video can be submitted for (from the site's games). */
  games: { id: string; name: string }[];
  /** The member's linked SteamID64, which opens their own Leetify page; null when not linked. */
  steamId: string | null;
};

/**
 * Where members find their Leetify highlights, behind a button that opens a dialog. Only a link: the
 * site never calls Leetify or Allstar (Leetify's public API has no videos), so members download a clip
 * or share it to YouTube themselves.
 */
function LeetifyGuide({ steamId }: { steamId: string | null }) {
  return (
    <InfoDialog id="leetify-guide" title="從 Leetify 找你的精彩片段" label="從 Leetify 找片段">
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-body text-ink">
        <li>
          到 Leetify 打開你的精彩片段：
          {steamId ? (
            <TextLink href={`https://leetify.com/app/profile/${steamId}`}>開啟我的 Leetify 頁面</TextLink>
          ) : (
            <>
              <TextLink href="https://leetify.com">前往 Leetify</TextLink>
              <span className="block text-caption text-ink-secondary">
                綁定 Steam 後，這裡會直接連到你的 Leetify 頁面。
              </span>
            </>
          )}
        </li>
        <li>在片段頁下載影片，或分享到 YouTube 後複製連結。</li>
        <li>回到投稿表單，上傳影片檔或貼上 YouTube 連結。</li>
      </ol>
    </InfoDialog>
  );
}

/**
 * The 投稿影片 tab in two columns: the notice and forms (when not paused and the role may submit) on
 * the left, the member's history on the right; stacked in that order below 1024px.
 */
export function MemberVideosPanel({ submissions, games, steamId }: MemberVideosPanelProps) {
  return (
    <MemberTabColumns
      id="videos-title"
      eyebrow="Submit"
      title="投稿影片"
      main={
        submissions.paused ? (
          <p className="text-body text-ink-secondary">影片投稿目前暫停，恢復後即可投稿。</p>
        ) : !submissions.canSubmit ? (
          <p className="text-body text-ink-secondary">目前的角色不能投稿影片，如有需要請聯絡管理員。</p>
        ) : (
          <>
            <p className="max-w-xl text-body text-ink-secondary">
              為遊戲項目投稿你的 highlight 影片。投稿需經管理員審核，通過後會公開在網站上，並陸續上傳至官網 YouTube
              頻道。
            </p>
            {games.length === 0 ? (
              <p className="text-body text-ink-secondary">目前沒有可以投稿的遊戲項目。</p>
            ) : (
              <VideoSubmissionForms
                games={games}
                uploadsLeftToday={submissions.uploadsLeftToday}
                sourceAside={<LeetifyGuide steamId={steamId} />}
              />
            )}
          </>
        )
      }
      side={
        <section aria-labelledby="history-title" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <Heading level={3} id="history-title">
              投稿紀錄
            </Heading>
            <span className="font-mono text-meta text-ink-muted">{formatCount(submissions.items.length)}</span>
          </div>
          {submissions.items.length === 0 ? (
            <p className="text-body text-ink-secondary">還沒有投稿。</p>
          ) : (
            <VideoSubmissionList items={submissions.items} />
          )}
        </section>
      }
    />
  );
}
