export type TeamProfile = {
  name: string;
  introduction: string;
  mission: string;
  // Brand fields: "" (or null for foundedYear) until an admin fills them in.
  tagline: string;
  brandStatement: string;
  foundedYear: number | null;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
};

export type Milestone = { id: string; title: string; description: string; date: string };

export type ContactInfo = { id: string; label: string; type: string; value: string };

/** One of a game's featured highlight videos (the admin picks up to five and their order). */
export type GameVideo =
  | ({ id: string; source: "youtube"; title: string; recordedOn: string; youtubeId: string } & VideoMember)
  | ({ id: string; source: "upload"; title: string; recordedOn: string; url: string; mimeType: string } & VideoMember);

/** The nickname of the member a video is credited to (the submitter); null or missing when none. */
type VideoMember = { memberNickname?: string | null };

/** `videos`: the home picks (ranked by members' likes in the backend) in play order; empty when none. */
export type Game = { id: string; name: string; summary: string; videos: GameVideo[] };

/** icon is a backend code (see components/about/highlight-icon.tsx). */
export type Highlight = { id: string; icon: string; title: string; content: string };

export type RoadmapStatus = "planned" | "in_progress" | "launched";

export type RoadmapItem = { id: string; title: string; description: string; status: RoadmapStatus };

export type SocialPlatform = "discord" | "youtube" | "instagram" | "facebook" | "twitch" | "x" | "other";

/** `label` is empty for a known platform without a custom name. */
export type SocialLink = { id: string; platform: SocialPlatform; label: string; url: string };

export type AboutContent = {
  teamProfile: TeamProfile;
  milestones: Milestone[];
  contactInfo: ContactInfo[];
  highlights: Highlight[];
  games: Game[];
  roadmap: RoadmapItem[];
  socialLinks: SocialLink[];
  /** Figures the backend computes; `members` counts activated members only. */
  stats: { members: number };
};
