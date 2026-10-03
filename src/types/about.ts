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
  closingStatement: string;
};

export type Milestone = { id: string; title: string; description: string; date: string };

export type ContactInfo = { id: string; label: string; type: string; value: string };

export type Game = { id: string; name: string; summary: string; description: string };

export type AboutContent = {
  teamProfile: TeamProfile;
  milestones: Milestone[];
  contactInfo: ContactInfo[];
  highlights: string[];
  games: Game[];
};
