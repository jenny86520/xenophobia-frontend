import { render, screen } from "@testing-library/react";
import type { AboutContent } from "@/types/about";
import { SiteFooter } from "./site-footer";

const about = (contactInfo: AboutContent["contactInfo"]): AboutContent => ({
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
    closingStatement: "",
  },
  milestones: [],
  contactInfo,
  highlights: [],
  games: [],
});

describe("SiteFooter", () => {
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

  it("lists social links when present", () => {
    const { container } = render(
      <SiteFooter
        brandName="XenoPhobiA"
        version="0.1.0"
        about={about([{ id: "2", label: "Discord", type: "social", value: "https://discord.gg/x" }])}
      />,
    );

    expect(container.querySelector('[data-placeholder="contact.social"]')).toBeNull();
    expect(screen.getByRole("link", { name: /discord\.gg/ })).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the build version and legal placeholders", () => {
    render(<SiteFooter brandName="XenoPhobiA" version="0.1.0" about={null} />);
    expect(screen.getByText(/Build 0\.1\.0/)).toBeInTheDocument();
    expect(screen.getByText("待提供：隱私權政策")).toBeInTheDocument();
  });
});
