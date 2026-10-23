"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GameVideo } from "@/types/about";

type GameVideoControlsProps = {
  videos: GameVideo[];
  active: number;
  /** Switches to a video by index (the carousel wraps previous/next around the ends). */
  onSelect: (index: number) => void;
};

const BUTTON =
  "inline-flex size-10 items-center justify-center rounded-sm border border-line text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * Previous / next and one numbered button per video, under the player. Only rendered for two or
 * more videos, after hydration (the buttons would do nothing without JavaScript).
 */
export function GameVideoControls({ videos, active, onSelect }: GameVideoControlsProps) {
  const total = videos.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        className={BUTTON}
        aria-label="上一部"
        onClick={() => onSelect((active - 1 + total) % total)}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      <div role="group" aria-label="選擇影片" className="flex flex-wrap gap-1.5">
        {videos.map((video, index) => {
          const current = index === active;
          return (
            <button
              key={video.id}
              type="button"
              className={`${BUTTON} font-mono text-meta tabular-nums ${current ? "border-line-strong bg-surface-elevated text-signal" : ""}`}
              aria-label={`第 ${index + 1} 部：${video.title}`}
              aria-current={current ? "true" : undefined}
              onClick={() => onSelect(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={BUTTON}
        aria-label="下一部"
        onClick={() => onSelect((active + 1) % total)}
      >
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </div>
  );
}
