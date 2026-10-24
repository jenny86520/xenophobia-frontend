/** A guest player (signed in with Steam, no member account), as GET /api/player/me returns it. */
export type GuestPlayer = {
  id: string;
  steamId: string;
  profileUrl: string;
  /** Empty until the guest chooses one (the player page asks first). */
  nickname: string;
  /** Public Steam name, when the site is set up to read it. */
  steamName: string | null;
  avatarUrl: string | null;
  status: "active" | "disabled";
  createdAt: string;
  lastLoginAt: string | null;
};

/** A member's linked Steam account. */
export type SteamAccount = {
  steamId: string;
  steamName: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  linkedAt: string | null;
};
