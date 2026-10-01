export type PartyLifecycleStatus = "ongoing" | "ended";

/** Maps a raw party status string to its display lifecycle (single source, replaces duplicated `toLifecycle`). */
export function resolvePartyLifecycleStatus(partyStatus: string): PartyLifecycleStatus {
  return partyStatus === "expired" ? "ended" : "ongoing";
}
