import {
  fetchAboutContent,
  fetchAllParties,
  fetchHomeNews,
  fetchLegends,
  fetchUpcomingParty,
} from "@/lib/public-content-client";
import { Closing } from "./_sections/closing";
import { Events } from "./_sections/events";
import { Games } from "./_sections/games";
import { Hero } from "./_sections/hero";
import { Legends } from "./_sections/legends";
import { BrandMarquee } from "./_sections/marquee";
import { News } from "./_sections/news";
import { Statement } from "./_sections/statement";

/**
 * Brand home (design §1): Hero, the scrolling wordmark, Statement, What we play, Legends,
 * Events, News (最新消息 only; the milestones live on /about), Closing. Rendered on the server per request; Countdown is the only client island.
 */
export default async function HomePage() {
  const [about, upcoming, parties, legends, news] = await Promise.all([
    fetchAboutContent(),
    fetchUpcomingParty(),
    fetchAllParties(),
    fetchLegends(),
    fetchHomeNews(),
  ]);
  const { teamProfile, games, contactInfo, stats } = about;

  return (
    <main id="main">
      <Hero profile={teamProfile} nextParty={upcoming.nextParty} />
      <BrandMarquee name={teamProfile.name} />
      <Statement
        profile={teamProfile}
        stats={{ members: stats.members, parties: parties.length, games: games.length }}
      />
      <Games games={games} index={2} />
      <Legends legends={legends} />
      <Events nextParty={upcoming.nextParty} recentParties={upcoming.recentParties} />
      <News items={news} index={5} />
      <Closing profile={teamProfile} contacts={contactInfo} />
    </main>
  );
}
