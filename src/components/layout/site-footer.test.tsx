import { render, screen, within } from "@testing-library/react";
import type { AboutContent } from "@/types/about";
import { SiteFooter } from "./site-footer";

const about = (
  contactInfo: AboutContent["contactInfo"],
  socialLinks: AboutContent["socialLinks"] = [],
): AboutContent => ({
  teamProfile: {
    name: "XenoPhobiA",
    introduction: "",
    mission: "",
    tagline: "",
    brandStatement: "",
    foundedYear: null,
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
  },
  milestones: [],
  contactInfo,
  highlights: [],
  games: [],
  roadmap: [],
  socialLinks,
});

describe("SiteFooter", () => {
  it("lists Home, Party and About in English, marked as English", () => {
    render(<SiteFooter brandName="XenoPhobiA" version="0.1.0" about={about([])} />);

    const links = within(screen.getByRole("navigation", { name: "Index" })).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href"), a.getAttribute("lang")])).toEqual([
      ["Home", "/", "en"],
      ["Party", "/party", "en"],
      ["About", "/about", "en"],
    ]);
  });

  it("shows a placeholder when there are no social links", () => {
    const { container } = render(
      <SiteFooter
        brandName="XenoPhobiA"
        version="0.1.0"
        about={about([{ id: "1", label: "Email", type: "email", value: "team@x.team" }])}
      />,
    );

    expect(container.querySelector('[data-placeholder="contact.social"]')).not.toBeNull();
    expect(screen.getByText("待提供：社群連結")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "team@x.team" })).toHaveAttribute("href", "mailto:team@x.team");
  });

  it("lists social links in order with the platform icon and name, opening in a new tab", () => {
    const { container } = render(
      <SiteFooter
        brandName="XenoPhobiA"
        version="0.1.0"
        about={about(
          [],
          [
            { id: "s1", platform: "discord", label: "", url: "https://discord.gg/x" },
            { id: "s2", platform: "other", label: "官方部落格", url: "https://blog.x.team" },
          ],
        )}
      />,
    );

    expect(container.querySelector('[data-placeholder="contact.social"]')).toBeNull();
    const links = within(screen.getByRole("region", { name: "Social" })).getAllByRole("link");
    expect(links.map((a) => [a.textContent?.replace("（另開新視窗）", "").replace(" ↗", ""), a.getAttribute("href")])).toEqual([
      ["Discord", "https://discord.gg/x"],
      ["官方部落格", "https://blog.x.team"],
    ]);
    links.forEach((a) => {
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
      expect(a.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });
    expect(links[0].querySelector('svg[data-platform="discord"]')).not.toBeNull();
  });

  it("shows the build version and legal placeholders", () => {
    render(<SiteFooter brandName="XenoPhobiA" version="0.1.0" about={null} />);
    expect(screen.getByText(/Build 0\.1\.0/)).toBeInTheDocument();
    expect(screen.getByText("待提供：隱私權政策")).toBeInTheDocument();
  });

  it("shows the brand name with its uppercase letters in red, and plain text in the copyright", () => {
    const { container } = render(<SiteFooter brandName="XenoPhobiA" version="0.1.0" about={null} />);

    const red = Array.from(container.querySelectorAll(".text-signal")).map((el) => el.textContent);
    expect(red).toEqual(["X", "P", "A"]);
    expect(screen.getByText(/© [0-9]{4} XenoPhobiA/)).toBeInTheDocument();
  });
});
