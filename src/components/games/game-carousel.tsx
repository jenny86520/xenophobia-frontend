"use client";

import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { Placeholder } from "@/components/brand/placeholder";
import type { Game } from "@/types/about";
import { GameHighlightPlayer } from "./game-highlight-player";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(REDUCED_MOTION).matches
    : false;
}

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener?.("change", onChange);
  return () => query.removeEventListener?.("change", onChange);
}

const noSubscription = () => () => {};

/** Keys that move focus between panel buttons, mapped to the target index. */
function targetIndex(key: string, index: number, total: number): number | null {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return Math.min(total - 1, index + 1);
    case "ArrowLeft":
    case "ArrowUp":
      return Math.max(0, index - 1);
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return null;
  }
}

/**
 * Expanding games carousel (visual-design-system「遊戲輪播」): every game is a panel,
 * exactly one is expanded. Panels sit side by side from 768px (the expanded one takes
 * the width) and stack below it (layout in globals.css `.game-panels`); switching is
 * instant, with no transition. The first panel is expanded in
 * the server HTML, so it is open without JavaScript too. Collapsed bodies are `inert`.
 * Only the expanded panel mounts a player, and only after hydration, so autoplay can
 * respect prefers-reduced-motion. It never switches by itself.
 */
export function GameCarousel({ games }: { games: Game[] }) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const total = games.length;
  // False on the server and during hydration, so the player (and any autoplay) only
  // appears once the client knows the visitor's motion preference.
  const mounted = useSyncExternalStore(noSubscription, () => true, () => false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);

  function expand(index: number) {
    if (index === active) return;
    setActive(index);
    setAnnouncement(`${games[index].name}（第 ${index + 1} 個，共 ${total} 個）`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const target = targetIndex(event.key, index, total);
    if (target === null) return;
    event.preventDefault();
    buttons.current[target]?.focus();
  }

  return (
    <div role="region" aria-roledescription="carousel" aria-label="遊戲項目輪播">
      <div className="game-panels">
        {games.map((game, index) => {
          const expanded = index === active;
          const video = game.latestVideo;
          const buttonId = `${baseId}-button-${index}`;
          const bodyId = `${baseId}-body-${index}`;
          return (
            <div
              key={game.id}
              className="game-panel"
              data-expanded={expanded}
              role="group"
              aria-roledescription="slide"
              aria-label={`第 ${index + 1} 個，共 ${total} 個：${game.name}`}
            >
              <h3 className="game-panel-heading">
                <button
                  ref={(element) => {
                    buttons.current[index] = element;
                  }}
                  id={buttonId}
                  type="button"
                  className="game-panel-button"
                  aria-expanded={expanded}
                  aria-controls={bodyId}
                  onClick={() => expand(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <span className="font-mono text-meta text-signal">{formatCount(index + 1)}</span>
                  <span className="game-panel-name font-heading text-h3 text-ink">{game.name}</span>
                </button>
              </h3>
              <div id={bodyId} role="region" aria-labelledby={buttonId} className="game-panel-body" inert={!expanded}>
                <div className="game-panel-inner">
                  <div className="flex flex-col gap-4 pb-6">
                    <div className="relative aspect-video overflow-hidden bg-surface">
                      {video && expanded && mounted ? (
                        <GameHighlightPlayer gameName={game.name} video={video} autoplay={!reducedMotion} />
                      ) : video ? (
                        <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 border border-line p-5">
                          <MetaLabel className="text-ink-secondary">▶ Highlight</MetaLabel>
                          <span className="text-body text-ink">{video.title}</span>
                        </div>
                      ) : (
                        <Placeholder
                          name={`game.${game.id}.video`}
                          label="最新 highlight 影片"
                          className="absolute inset-0"
                        />
                      )}
                    </div>
                    <p className="max-w-[60ch] text-body text-ink-secondary">
                      {game.summary || <Placeholder name={`game.${game.id}.summary`} label="遊戲短述" inline />}
                    </p>
                    {video && (
                      <MetaLabel>
                        {video.title} · {video.recordedOn}
                      </MetaLabel>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
