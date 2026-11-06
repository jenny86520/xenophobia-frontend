import { MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchVeto } from "@/types/match";
import { radarPoint, radarPolygon, radarRings, radarScale, toPoints } from "@/utils/radar";

/** The drawing's own square; labels sit in the margin the view box adds around it. */
const SIZE = 200;
const LABEL_RATIO = 1.14;

/**
 * The CS2-style radar of the veto: one axis per map, each team's wins on it (added up by the
 * backend) as a polygon, A solid and B dashed so they differ without colour. The drawing is
 * decorative: the map cards say the same in words, and VetoRadarLegend names the lines. Inside a wide veto panel the cards sit around
 * it and its corner names hide; narrower, the corners keep their names and the cards follow.
 */
export function VetoRadar({ veto }: { veto: MatchVeto }) {
  const count = veto.maps.length;
  const scale = radarScale(veto.maps.flatMap((map) => [map.wins.A, map.wins.B]));
  const polygon = (side: "A" | "B") =>
    toPoints(
      radarPolygon(
        veto.maps.map((map) => map.wins[side]),
        scale,
        SIZE,
      ),
    );
  return (
    <svg
      viewBox="-64 -24 328 248"
      aria-hidden="true"
      className="mx-auto w-full max-w-md overflow-visible @xl:max-w-none"
      data-radar
    >
      {radarRings(count, SIZE).map((ring, i) => (
        <polygon key={i} points={toPoints(ring)} className="fill-none stroke-line-subtle" strokeWidth={1} />
      ))}
      {veto.maps.map((map, i) => {
        const end = radarPoint(i, count, 1, SIZE);
        return <line key={map.key} x1={SIZE / 2} y1={SIZE / 2} x2={end.x} y2={end.y} className="stroke-line-subtle" />;
      })}
      <polygon points={polygon("B")} className="fill-ink/10 stroke-ink" strokeWidth={2} strokeDasharray="5 4" />
      <polygon points={polygon("A")} className="fill-signal/20 stroke-signal" strokeWidth={2} />
      {veto.maps.map((map, i) => {
        const at = radarPoint(i, count, LABEL_RATIO, SIZE);
        const anchor = Math.abs(at.x - SIZE / 2) < 4 ? "middle" : at.x < SIZE / 2 ? "end" : "start";
        const isFinal = veto.finalMap?.key === map.key;
        return (
          <text
            key={map.key}
            x={at.x}
            y={at.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            data-map-label={map.key}
            className={cn(
              // Around the radar the map cards name the corners (@xl of the veto panel).
              "text-[11px] @xl:hidden",
              map.bannedBy ? "fill-ink-muted line-through" : isFinal ? "fill-signal" : "fill-ink",
            )}
          >
            {map.name}
            {map.bannedBy && " ✕"}
          </text>
        );
      })}
    </svg>
  );
}

/** What the radar shows, in words: each team's line style and what the values mean. */
export function VetoRadarLegend({ veto, teamNames }: { veto: MatchVeto; teamNames: { A: string; B: string } }) {
  return (
  <figcaption className="flex flex-col items-center gap-2 text-center">
      <span className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-caption text-ink">
        <span className="inline-flex items-center gap-2">
          <svg aria-hidden="true" viewBox="0 0 24 4" className="h-1 w-6">
            <line x1="0" y1="2" x2="24" y2="2" className="stroke-signal" strokeWidth={3} />
          </svg>
          {`${teamNames.A}（實線）`}
        </span>
        <span className="inline-flex items-center gap-2">
          <svg aria-hidden="true" viewBox="0 0 24 4" className="h-1 w-6">
            <line x1="0" y1="2" x2="24" y2="2" className="stroke-ink" strokeWidth={3} strokeDasharray="5 4" />
          </svg>
          {`${teamNames.B}（虛線）`}
        </span>
      </span>
      <span className="text-caption text-ink-secondary">
        兩隊隊員在各地圖的贏場數加總（網站上已完成的場次）；✕ 為已 Ban
        {veto.finalMap && (
          <>
            ，<MapPinned aria-hidden="true" className="inline size-3.5 text-signal" />
            比賽地圖為 {veto.finalMap.name}
          </>
        )}
        。
      </span>
  </figcaption>
  );
}
