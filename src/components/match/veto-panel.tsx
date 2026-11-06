import { Ban, MapPinned } from "lucide-react";
import type { CSSProperties } from "react";
import { Heading } from "@/components/brand/typography";
import { cn } from "@/lib/utils";
import type { FirstBanReason, MatchStatus, MatchVeto, VetoRule } from "@/types/match";
import { mediaUrl } from "@/utils/media";
import { Spotlight } from "@/components/brand/spotlight";
import { CaptainBanButton } from "./match-forms";
import { StepCountdown } from "./veto-live";
import { VetoRadar, VetoRadarLegend } from "./veto-radar";
import { radarPoint } from "@/utils/radar";

/** How far out the cards sit around the radar, as a share of the panel's half width. */
const RING_RATIO = 0.74;

export const VETO_RULE_TEXT: Record<VetoRule, string> = {
  random: "隨機",
  stronger_first: "總分高的隊伍先手",
  weaker_first: "總分低的隊伍先手",
};

export const FIRST_BAN_REASON_TEXT: Record<FirstBanReason, string> = {
  random: "隨機抽籤",
  "a-higher": "A 隊總分較高",
  "b-higher": "B 隊總分較高",
  "a-lower": "A 隊總分較低",
  "b-lower": "B 隊總分較低",
  "tie-random": "兩隊同分，抽籤決定",
};

/**
 * The map veto for everyone, in the middle of the match room: who bans first and why, whose turn
 * it is and the time left, the radar of each team's wins per map, then the maps in words (each
 * team's wins, who banned it, the map played) and the history. The captain whose turn it is gets a
 * Ban button on each map left; nobody else sees a word on those maps. The room refreshes itself.
 */
export function VetoPanel({
  matchId,
  status,
  veto,
  canBan,
  teamNames,
}: {
  matchId: string;
  status: MatchStatus;
  veto: MatchVeto;
  canBan: boolean;
  teamNames: { A: string; B: string };
}) {
  const active = status === "veto_active";
  return (
    <div className="flex flex-col gap-6">
      <p className="text-body text-ink-secondary">
        先手：<span className="text-ink">{teamNames[veto.firstTeam]}</span>（{FIRST_BAN_REASON_TEXT[veto.firstReason]}
        ，規則為{VETO_RULE_TEXT[veto.rule]}）
      </p>

      {veto.finalMap ? (
        <p className="flex items-center gap-3 text-lead text-ink">
          <MapPinned aria-hidden="true" className="size-5 text-signal" />
          比賽地圖：<span className="font-heading text-h3">{veto.finalMap.name}</span>
        </p>
      ) : (
        active &&
        veto.turn &&
        veto.stepDeadline && (
          <p role="status" className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-lead text-ink">
            <span>
              輪到 {teamNames[veto.turn]}・第 {veto.step} 步
            </span>
            <span className={veto.overdue ? "text-signal" : "text-ink-secondary"}>
              <StepCountdown deadline={veto.stepDeadline} overdue={veto.overdue} />
            </span>
          </p>
        )
      )}
      {active && canBan && <p className="text-body text-ink">輪到你的隊伍，請選一張地圖 Ban。</p>}

      {/* A container: from @xl (576px) of its own width the map cards ring the radar, each towards
          its corner, as in CS2's own veto; narrower, the radar comes first and the cards follow. */}
      <figure className="flex flex-col gap-6 @container">
        <div className="relative flex flex-col gap-6 @xl:block @xl:aspect-square">
          <div className="@xl:absolute @xl:top-1/2 @xl:left-1/2 @xl:w-[78%] @xl:-translate-1/2">
            <VetoRadar veto={veto} />
          </div>
          <Spotlight className="@xl:absolute @xl:inset-0">
            <ul aria-label="地圖" className="grid grid-cols-2 gap-3 @xl:block @xl:size-full">
              {veto.maps.map((map, i) => {
                const isFinal = veto.finalMap?.key === map.key;
                const at = radarPoint(i, veto.maps.length, RING_RATIO, 100);
                return (
                  <li
                    key={map.key}
                    data-map={map.key}
                    data-spotlight
                    style={{ "--x": `${at.x}%`, "--y": `${at.y}%` } as CSSProperties}
                    className={cn(
                      "flex flex-col overflow-clip rounded-sm border bg-surface",
                      "@xl:absolute @xl:top-(--y) @xl:left-(--x) @xl:w-[24%] @xl:-translate-1/2",
                      isFinal ? "border-signal" : "border-line",
                    )}
                  >
                    <div className="relative isolate aspect-video">
                      <div aria-hidden="true" className="absolute inset-0 -z-10">
                        {map.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- upload on the backend origin, as party covers
                          <img
                            src={mediaUrl(map.imageUrl)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className={cn("media-reveal size-full object-cover", map.bannedBy && "opacity-50 grayscale")}
                          />
                        ) : (
                          <div data-map-fallback className="map-card-fallback size-full" />
                        )}
                        <div className="map-card-scrim absolute inset-0" />
                      </div>
                      <span
                        className={cn(
                          "absolute inset-x-2 bottom-1.5 font-heading text-lead text-ink",
                          map.bannedBy && "text-ink-secondary line-through",
                        )}
                      >
                        {map.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 px-2 py-2">
                      <span className="font-mono text-meta text-ink-secondary tabular-nums">
                        {`${teamNames.A} ${map.wins.A}・${teamNames.B} ${map.wins.B}`}
                      </span>
                      {map.bannedBy ? (
                        <span className="inline-flex items-start gap-1.5 text-caption text-ink-secondary">
                          <Ban aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-signal" />
                          <span className="flex flex-col">
                            <span>{`${teamNames[map.bannedBy]} Ban`}</span>
                            <span>{`（第 ${map.step} 步）`}</span>
                          </span>
                        </span>
                      ) : isFinal ? (
                        <span className="inline-flex items-center gap-1.5 text-caption text-ink">
                          <MapPinned aria-hidden="true" className="size-4 shrink-0 text-signal" />
                          比賽地圖
                        </span>
                      ) : (
                        active &&
                        canBan &&
                        veto.step && (
                          <CaptainBanButton matchId={matchId} step={veto.step} mapKey={map.key} mapName={map.name} />
                        )
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Spotlight>
        </div>
        <VetoRadarLegend veto={veto} teamNames={teamNames} />
      </figure>

      {veto.bans.length > 0 && (
        <div className="flex flex-col gap-3">
          <Heading level={3}>紀錄</Heading>
          <ol className="border-t border-line">
            {veto.bans.map((ban) => (
              <li key={ban.step} className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line py-2">
                <span className="text-body text-ink">
                  第 {ban.step} 步・{teamNames[ban.team]} Ban {ban.mapName}
                </span>
                <span className="text-caption text-ink-secondary">
                  {/* Captains never ban at random, so a random ban not by a manager is the system's. */}
                  {!ban.byManager && ban.random ? (
                    "時間到，系統隨機 Ban"
                  ) : (
                    <>
                      {ban.actorLabel}
                      {ban.byManager && (ban.random ? "（管理者隨機 Ban）" : "（管理者代為 Ban）")}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
