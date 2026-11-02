import type { Metadata } from "next";
import { InfoDialog } from "@/components/brand/info-dialog";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { LegendBoard } from "@/components/legends/legend-board";
import { fetchLegends } from "@/lib/public-content-client";

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
    rules: "計算報名並且已經開始的活動次數；只有日期的活動在當天結束後才計入，時間待定的活動不計入。子派對另有排行榜。",
  },
  "sub-party-attendance": {
    tagline: "一個派對裡的每一場，都有他們的身影。",
    rules: "計算報名並且已經開始的子派對，每個子派對算一次；只有日期的子派對在當天結束後才計入。",
  },
  "scrim-matches": {
    tagline: "一場接一場，從不缺席的內戰常駐戰力。",
    rules: "計算隊伍確認之後的內戰場次。",
  },
  "scrim-cancelled": {
    tagline: "報了名，場次卻沒打成……這份榜單，你懂的。",
    rules: "計算報名後場次被取消的次數；自己先退出的報名不計算。這份榜單只是好玩，不計入總排行。",
  },
};

/**
 * The Legends page: the overall ranking first, then every board in the order admins set. The
 * backend ranks; this page only lays the places out. Counting rules sit behind ⓘ popovers.
 */
export default async function LegendsPage() {
  const legends = await fetchLegends();

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

      <LegendBoard
        code="overall"
        title={legends.overall.title}
        metric="總排行"
        unit="分"
        countsTowardOverall
        {...OVERALL_COPY}
        entries={legends.overall.entries.map(({ rank, nickname, points }) => ({ rank, nickname, value: points }))}
      />
      {legends.boards.map((board) => (
        <LegendBoard key={board.code} {...board} {...BOARD_COPY[board.code]} />
      ))}
    </main>
  );
}
