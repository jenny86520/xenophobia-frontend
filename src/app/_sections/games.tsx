import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { Placeholder } from "@/components/brand/placeholder";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { GameCarousel } from "@/components/games/game-carousel";
import type { Game } from "@/types/about";

type GamesProps = {
  games: Game[];
  /** Chapter number in the page's eyebrow sequence. */
  index: number;
};

/**
 * 3 · What we play: a carousel of the games, each playing its home picks (the backend ranks them by
 * members' likes), and a link to every clip on /clips.
 */
export function Games({ games, index }: GamesProps) {
  return (
    <Section labelledBy="games-title" ruled className="reveal" id="games">
      <EditorialGrid className="gap-y-8">
        <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
          <Eyebrow index={index}>What we play</Eyebrow>
          <Heading level={2} id="games-title">
            遊戲項目
          </Heading>
          <MetaLabel>{formatCount(games.length)} Titles</MetaLabel>
          <TextLink href="/clips" lang="en" className="cta-secondary self-start text-body text-ink">
            All clips <span aria-hidden="true">→</span>
          </TextLink>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
          {games.length > 0 ? (
            <GameCarousel games={games} />
          ) : (
            <Placeholder name="games" label="遊戲項目" className="min-h-32" />
          )}
        </div>
      </EditorialGrid>
    </Section>
  );
}
