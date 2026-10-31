import { fetchAboutContent, fetchAllParties, fetchLegends, fetchUpcomingParty } from "@/lib/public-content-client";
import { Archive } from "./_sections/archive";
import { Closing } from "./_sections/closing";
import { Events } from "./_sections/events";
import { Games } from "./_sections/games";
import { Hero } from "./_sections/hero";
import { Legends } from "./_sections/legends";
import { BrandMarquee } from "./_sections/marquee";
import { Statement } from "./_sections/statement";

/**
 * Brand home (design §1): Hero, the scrolling wordmark, Statement, What we play, Legends,
 * Events, Archive, Closing. Rendered on the server per request; Countdown is the only client island.
 */
export default async function HomePage() {
  const [about, upcoming, parties, legends] = await Promise.all([
    fetchAboutContent(),
    fetchUpcomingParty(),
    fetchAllParties(),
    fetchLegends(),
  ]);
  const { teamProfile, games, milestones, contactInfo } = about;

  return (
    <main id="main">
      <Hero profile={teamProfile} nextParty={upcoming.nextParty} />
      <BrandMarquee name={teamProfile.name} />
      <Statement
        profile={teamProfile}
        stats={{ parties: parties.length, games: games.length, milestones: milestones.length }}
      />
      <Games games={games} index={2} />
      <Legends legends={legends} />
      <Events nextParty={upcoming.nextParty} recentParties={upcoming.recentParties} />
      <Archive milestones={milestones} index={5} />
      <Closing profile={teamProfile} contacts={contactInfo} />
    </main>
  );
}
