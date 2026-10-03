import { fetchAboutContent, fetchAllParties, fetchUpcomingParty } from "@/lib/public-content-client";
import { Archive } from "./_sections/archive";
import { Closing } from "./_sections/closing";
import { Events } from "./_sections/events";
import { Gallery } from "./_sections/gallery";
import { Games } from "./_sections/games";
import { Hero } from "./_sections/hero";
import { Statement } from "./_sections/statement";

/**
 * Brand home (design §1): Hero, Statement, What we play, Events, Archive, Gallery,
 * Closing. Rendered on the server per request; Countdown is the only client island.
 */
export default async function HomePage() {
  const [about, upcoming, parties] = await Promise.all([
    fetchAboutContent(),
    fetchUpcomingParty(),
    fetchAllParties(),
  ]);
  const { teamProfile, games, milestones } = about;

  return (
    <main id="main">
      <Hero profile={teamProfile} nextParty={upcoming.nextParty} />
      <Statement
        profile={teamProfile}
        stats={{ parties: parties.length, games: games.length, milestones: milestones.length }}
      />
      <Games games={games} index={2} />
      <Events nextParty={upcoming.nextParty} recentParties={upcoming.recentParties} />
      <Archive milestones={milestones} index={4} />
      <Gallery />
      <Closing profile={teamProfile} />
    </main>
  );
}
