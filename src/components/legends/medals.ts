/** Places that get a trophy: gold, silver and bronze, as in any competition. */
export const MEDAL_PLACES = 3;

/** Text (trophy) and border colour per medal place; the place is always written out as well. */
export const MEDALS: Record<number, { text: string; border: string }> = {
  1: { text: "text-gold", border: "border-gold" },
  2: { text: "text-silver", border: "border-silver" },
  3: { text: "text-bronze", border: "border-bronze" },
};
