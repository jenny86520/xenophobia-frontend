import { formatCount } from "@/components/brand/meta-label";
import { Heading } from "@/components/brand/typography";
import type { MemberVideoSubmissions } from "@/types/member";
import { MemberTabPanel } from "./member-tabs";
import { VideoSubmissionForms } from "./video-submission-forms";
import { VideoSubmissionList } from "./video-submission-list";

/** Shown above the form at all times: what happens after submitting, and the upload limits. */
const NOTICES = [
  "投稿後需由管理員審核，通過後才會出現在網站上。",
  "通過的影片會陸續上傳至官網 YouTube 頻道。",
  "上傳影片檔每天最多 5 部，限 MP4／WebM、500 MB 以內；YouTube 連結不限次數。",
];

type MemberVideosPanelProps = {
  submissions: MemberVideoSubmissions;
  /** The games a video can be submitted for (from the site's games). */
  games: { id: string; name: string }[];
};

/** The 投稿影片 tab: the notice and forms (when not paused and the role may submit), then the member's history. */
export function MemberVideosPanel({ submissions, games }: MemberVideosPanelProps) {
  return (
    <MemberTabPanel id="videos-title" eyebrow="Submit" title="投稿影片">
      {submissions.paused ? (
        <p className="text-body text-ink-secondary">影片投稿目前暫停，恢復後即可投稿。</p>
      ) : !submissions.canSubmit ? (
        <p className="text-body text-ink-secondary">目前的角色不能投稿影片，如有需要請聯絡管理員。</p>
      ) : (
        <>
          <p className="text-body text-ink-secondary">
            為遊戲項目投稿你的 highlight 影片，可以貼 YouTube 連結或上傳影片檔。
          </p>
          <ul className="flex max-w-xl flex-col gap-2 border-l-2 border-signal pl-4" aria-label="投稿須知">
            {NOTICES.map((notice) => (
              <li key={notice} className="text-body text-ink">
                {notice}
              </li>
            ))}
          </ul>
          {games.length === 0 ? (
            <p className="text-body text-ink-secondary">目前沒有可以投稿的遊戲項目。</p>
          ) : (
            <VideoSubmissionForms games={games} uploadsLeftToday={submissions.uploadsLeftToday} />
          )}
        </>
      )}

      <section aria-labelledby="history-title" className="flex flex-col gap-4 border-t border-line pt-8">
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
    </MemberTabPanel>
  );
}
