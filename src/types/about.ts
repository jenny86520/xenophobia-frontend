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

/** A game's newest highlight video, chosen by the backend (newest date, then newest added). */
export type LatestVideo =
  | { source: "youtube"; title: string; recordedOn: string; youtubeId: string }
  | { source: "upload"; title: string; recordedOn: string; url: string; mimeType: string };

export type Game = { id: string; name: string; summary: string; latestVideo: LatestVideo | null };

export type Highlight = { id: string; title: string; content: string };

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
};
