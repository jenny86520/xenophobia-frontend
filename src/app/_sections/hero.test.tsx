import { render, screen } from "@testing-library/react";
import type { TeamProfile } from "@/types/about";
import { Hero } from "./hero";

jest.mock("@/components/party/countdown", () => ({ Countdown: () => null }));

const profile = (name: string): TeamProfile => ({
  name,
  introduction: "",
  mission: "",
  tagline: "",
  brandStatement: "",
  foundedYear: 2020,
  primaryCtaLabel: "",
  primaryCtaUrl: "",
  secondaryCtaLabel: "",
  secondaryCtaUrl: "",
});

const wordmark = () => screen.getByRole("heading", { level: 1 });

describe("Hero wordmark", () => {
  it("passes the name's length to the size", () => {
    render(<Hero profile={profile("XenoPhobiA")} nextParty={null} />);
    expect(wordmark().style.getPropertyValue("--hero-chars")).toBe("10");
  });

  it("gives a longer name a smaller share of the width, with a floor, and lets it wrap", () => {
    render(<Hero profile={profile("Xenophobia Team")} nextParty={null} />);
    const heading = wordmark();
    expect(heading.style.getPropertyValue("--hero-chars")).toBe("15");
    // Up to ten characters the size equals the old min(14vw, 13rem); the floors are 2.5rem and 6rem from lg.
    expect(heading.className).toContain(
      "max-lg:text-[length:max(2.5rem,min(13rem,calc(140vw/max(var(--hero-chars),10))))]",
    );
    expect(heading.className).toContain("lg:text-[length:max(6rem,min(13rem,calc(140vw/max(var(--hero-chars),10))))]");
    expect(heading.className).toContain("text-balance");
    expect(heading.className).not.toContain("whitespace-nowrap");
  });
});
