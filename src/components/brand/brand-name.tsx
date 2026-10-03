const isUpper = (ch: string) => ch !== ch.toLowerCase();

/** Splits a name into runs of uppercase letters and everything else: "XenoPhobiA" -> X|eno|P|hobi|A. */
export function splitByCase(name: string): { text: string; upper: boolean }[] {
  const runs: { text: string; upper: boolean }[] = [];
  for (const ch of name) {
    const upper = isUpper(ch);
    const last = runs[runs.length - 1];
    if (last && last.upper === upper) last.text += ch;
    else runs.push({ text: ch, upper });
  }
  return runs;
}

/**
 * The brand name with its originally-uppercase letters in signal red, so "XenoPhobiA"
 * reads as XPA even where CSS renders the whole name uppercase. Case comes from the
 * backend string itself; nothing about the brand is hard-coded here.
 *
 * Some screen readers read each inline span as its own word ("X eno P hobi A"), so the
 * coloured runs are aria-hidden and assistive tech gets the whole name once.
 */
export function BrandName({ name }: { name: string }) {
  return (
    <>
      <span aria-hidden="true">
        {splitByCase(name).map((run, i) =>
          run.upper ? (
            <span key={i} className="text-signal">
              {run.text}
            </span>
          ) : (
            run.text
          ),
        )}
      </span>
      <span className="sr-only">{name}</span>
    </>
  );
}
