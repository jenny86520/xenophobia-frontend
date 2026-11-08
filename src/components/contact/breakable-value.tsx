import { Fragment } from "react";
import { splitAfterSeparators } from "@/utils/contact";

/**
 * A contact value that may only wrap after `@` and `.` (a `<wbr>` there). Pair it with
 * `[overflow-wrap:anywhere]` on the element so a run that still does not fit breaks rather than
 * scrolling sideways. `<wbr>` leaves the text, the accessible name and a copy unchanged.
 */
export function BreakableValue({ value }: { value: string }) {
  return splitAfterSeparators(value).map((part, index) => (
    <Fragment key={index}>
      {index > 0 && <wbr />}
      {part}
    </Fragment>
  ));
}
