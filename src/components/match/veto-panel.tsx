import { Ban, MapPinned } from "lucide-react";
import { Heading } from "@/components/brand/typography";
import { cn } from "@/lib/utils";
import type { FirstBanReason, MatchStatus, MatchVeto, VetoRule } from "@/types/match";
import { mediaUrl } from "@/utils/media";
import { CaptainBanButton } from "./match-forms";
import { StepCountdown, VetoAutoRefresh } from "./veto-live";

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
 * The map veto for everyone: who bans first and why, whose turn it is and the time left, each
 * map's state in words (not only colour), the history and the final map. The captain whose turn
 * it is gets a Ban button on each map left. While the veto is on, the page refreshes itself.
 */
export function VetoPanel({
  matchId,
  status,
  veto,
  canBan,
}: {
  matchId: string;
  status: MatchStatus;
  veto: MatchVeto;
  canBan: boolean;
}) {
  const active = status === "veto_active";
  return (
    <div className="flex flex-col gap-8">
      <VetoAutoRefresh active={active} />
      <p className="text-body text-ink-secondary">
        先手：<span className="text-ink">{veto.firstTeam} 隊</span>（{FIRST_BAN_REASON_TEXT[veto.firstReason]}，規則為
        {VETO_RULE_TEXT[veto.rule]}）
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
              輪到 {veto.turn} 隊・第 {veto.step} 步
            </span>
            <span className={veto.overdue ? "text-signal" : "text-ink-secondary"}>
              <StepCountdown deadline={veto.stepDeadline} overdue={veto.overdue} />
            </span>
          </p>
        )
      )}
      {active && canBan && <p className="text-body text-ink">輪到你的隊伍，請選一張地圖 Ban。</p>}

      <ul aria-label="地圖" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {veto.maps.map((map) => {
          const isFinal = veto.finalMap?.key === map.key;
          return (
            <li
              key={map.key}
              data-map={map.key}
              className={cn(
                "flex flex-col overflow-hidden rounded-sm border bg-surface",
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
                      className={cn("size-full object-cover", map.bannedBy && "opacity-60 grayscale")}
                    />
                  ) : (
                    <div data-map-fallback className="map-card-fallback size-full" />
                  )}
                  <div className="map-card-scrim absolute inset-0" />
                </div>
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-2 font-heading text-h3 text-ink",
                    map.bannedBy && "text-ink-secondary",
                  )}
                >
                  {map.name}
                </span>
              </div>
              <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 px-3 py-2">
                {map.bannedBy ? (
                  <span className="inline-flex items-center gap-2 text-caption text-ink-secondary">
                    <Ban aria-hidden="true" className="size-4 text-signal" />
                    {map.bannedBy} 隊 Ban（第 {map.step} 步）
                  </span>
                ) : isFinal ? (
                  <span className="inline-flex items-center gap-2 text-caption text-ink">
                    <MapPinned aria-hidden="true" className="size-4 text-signal" />
                    比賽地圖
                  </span>
                ) : active && canBan && veto.step ? (
                  <CaptainBanButton matchId={matchId} step={veto.step} mapKey={map.key} mapName={map.name} />
                ) : (
                  <span className="text-caption text-ink-secondary">可選</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {veto.bans.length > 0 && (
        <div className="flex flex-col gap-3">
          <Heading level={3}>紀錄</Heading>
          <ol className="border-t border-line">
            {veto.bans.map((ban) => (
              <li key={ban.step} className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line py-2">
                <span className="text-body text-ink">
                  第 {ban.step} 步・{ban.team} 隊 Ban {ban.mapName}
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
