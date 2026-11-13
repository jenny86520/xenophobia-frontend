import type { Metadata } from "next";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { InfoDialog } from "@/components/brand/info-dialog";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import {
  boardHeadingId,
  EmptyBoard,
  LegendBoard,
  LegendBoardHeader,
  LegendRows,
} from "@/components/legends/legend-board";
import { LegendLeaders } from "@/components/legends/legend-leaders";
import { LegendPodium } from "@/components/legends/legend-podium";
import { LegendTabs } from "@/components/legends/legend-tabs";
import { MEDAL_PLACES } from "@/components/legends/medals";
import { fetchLegends } from "@/lib/public-content-client";
import type { Legends } from "@/types/legends";
import { boardsIn, parseLegendTab, visibleTabs, type LegendTab } from "@/utils/legend-tabs";

export const metadata: Metadata = {
  title: "Legends",
  description: "XenoPhobiA 傳奇榜：派對與內戰場上最常出現、最難纏的會員都在這裡。",
};

/** What a board is about, for visitors, and how it is counted (behind ⓘ), by code. */
type BoardCopy = { tagline: string; rules: string };

const OVERALL_COPY: BoardCopy = {
  tagline: "各榜表現一次看，最全面的 XPA 傳奇。",
  rules:
    "每個計入總排行的排行榜，前 10 名依名次得分：第 1 名 10 分、第 2 名 9 分，依此類推到第 10 名 1 分，各榜得分加總就是總積分。標示「不計入總排行」的排行榜不加分。",
};

/** Boards the backend adds later simply have no copy. */
const BOARD_COPY: Record<string, BoardCopy> = {
  "scrim-rating": {
    tagline: "內戰場上的實力指標，分數越高越難纏。",
    rules: "依會員綁定的 Steam 帳號目前的內戰評分排名，只列出打過內戰的會員。",
  },
  "party-attendance": {
    tagline: "哪裡有派對，哪裡就有他們。",
    rules: "計算管理員點名記為到場的活動次數，只報名、沒有到場的不算。子派對另有排行榜。",
  },
  "sub-party-attendance": {
    tagline: "一個派對裡的每一場，都有他們的身影。",
    rules: "計算管理員點名記為到場的子派對，每個子派對算一次；只報名、沒有到場的不算。",
  },
  "scrim-matches": {
    tagline: "一場接一場，從不缺席的內戰常駐戰力。",
    rules: "計算隊伍確認之後的內戰場次。",
  },
  "scrim-cancelled": {
    tagline: "報了名，場次卻沒打成……這份榜單，你懂的。",
    rules: "計算報名後場次被取消的次數；自己先退出的報名不計算。這份榜單只是好玩，不計入總排行。",
  },
  "points-earned": {
    tagline: "點數一筆一筆累積，花掉的也算過。",
    rules: "計算會員至今獲得的所有點數，包括每日簽到、連續簽到獎勵與交易收到的點數；花掉的點數不會扣除。不計入總排行。",
  },
  "checkin-streak": {
    tagline: "天天報到，一天都沒漏。",
    rules: "計算會員最長連續每天簽到的天數（台灣時間）。跟簽到活動無關：換期或拿到連續簽到獎勵都不中斷，只有漏簽一天才重新計算。",
  },
};

/**
 * 總排行: the podium for places 1 to 3 (ties share a step), the places after them as rows, and beside
 * it (below on narrow screens) every board's first place.
 */
function OverallTab({ legends }: { legends: Legends }) {
  const { title, entries } = legends.overall;
  const podium = entries.filter((entry) => entry.rank <= MEDAL_PLACES);
  const rest = entries
    .filter((entry) => entry.rank > MEDAL_PLACES)
    .map(({ rank, nickname, points }) => ({ rank, nickname, value: points }));
  return (
    <EditorialGrid className="gap-y-16">
      <section
        aria-labelledby={boardHeadingId("overall")}
        className="col-span-4 flex min-w-0 flex-col gap-10 md:col-span-8 lg:col-span-7"
      >
        <LegendBoardHeader code="overall" title={title} metric="總排行" unit="分" countsTowardOverall {...OVERALL_COPY} />
        {entries.length === 0 ? (
          <EmptyBoard />
        ) : (
          <>
            <LegendPodium title={title} entries={podium} />
            {rest.length > 0 && <LegendRows label={`${title}第 ${MEDAL_PLACES + 1} 名起`} unit="分" entries={rest} />}
          </>
        )}
      </section>
      <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
        <LegendLeaders boards={legends.boards} />
      </div>
    </EditorialGrid>
  );
}

/** One category: its boards in the admins' order, side by side on wide screens. */
function BoardsTab({ tab, legends }: { tab: LegendTab; legends: Legends }) {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2 2xl:grid-cols-3">
      {boardsIn(tab, legends.boards).map((board) => (
        <LegendBoard key={board.code} {...board} {...BOARD_COPY[board.code]} />
      ))}
    </div>
  );
}

/**
 * The Legends page, in tabs from `?tab=` (links, so they work without JavaScript): 總排行 first, then
 * the categories that have boards. The backend ranks, orders and titles everything; this page only
 * decides which tab a board sits in. Counting rules sit behind ⓘ popovers.
 */
export default async function LegendsPage({ searchParams }: PageProps<"/legends">) {
  const [legends, query] = await Promise.all([fetchLegends(), searchParams]);
  const tab = parseLegendTab(query.tab, legends.boards);

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="LEGENDS / HALL"
          title="傳奇榜"
          description={
            <div className="flex items-start gap-2">
              <p>每一場派對、每一局內戰，都會在這裡留下名字。看看誰是 XPA 最常出現的身影、誰的實力最硬。</p>
              <InfoDialog id="legend-rules-page" title="傳奇榜怎麼算">
                <p>只有 XPA 會員會上榜，每個排行榜列出前 10 名，同分的會員名次相同。</p>
                <p>{OVERALL_COPY.rules}</p>
              </InfoDialog>
            </div>
          }
        />
      </Section>
      <Section spacing="tight" className="pt-0">
        <LegendTabs current={tab} tabs={visibleTabs(legends.boards)} />
        {tab === "overall" ? <OverallTab legends={legends} /> : <BoardsTab tab={tab} legends={legends} />}
      </Section>
    </main>
  );
}
