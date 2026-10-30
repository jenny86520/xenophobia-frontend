import { render, screen } from "@testing-library/react";
import { ContactList } from "./contact-list";

describe("ContactList", () => {
  it("lists contacts in the given order, linking what can be linked", () => {
    render(
      <ContactList
        contacts={[
          { id: "1", label: "Email", type: "email", value: "team@x.team" },
          { id: "2", label: "Website", type: "website", value: "https://discord.gg/x" },
          { id: "3", label: "LINE", type: "other", value: "@xpa" },
        ]}
      />,
    );

    expect(screen.getAllByRole("term").map((dt) => dt.textContent)).toEqual(["Email", "Website", "LINE"]);
    expect(screen.getByRole("link", { name: "team@x.team" })).toHaveAttribute("href", "mailto:team@x.team");
    const discord = screen.getByRole("link", { name: /discord\.gg/ });
    expect(discord).toHaveAttribute("rel", "noopener noreferrer");
    expect(discord).toHaveAttribute("target", "_blank");
    expect(screen.getByText("@xpa").closest("a")).toBeNull();
  });

  it("marks each entry with a decorative icon for its type", () => {
    render(
      <ContactList
        contacts={[
          { id: "1", label: "Email", type: "email", value: "team@x.team" },
          { id: "2", label: "Phone", type: "phone", value: "0912345678" },
          { id: "3", label: "Website", type: "website", value: "https://x.team" },
          { id: "4", label: "LINE", type: "other", value: "@xpa" },
        ]}
      />,
    );

    const icons = screen.getAllByRole("term").map((dt) => dt.querySelector("svg"));
    expect(icons.map((icon) => icon?.getAttribute("data-contact-type"))).toEqual([
      "email",
      "phone",
      "website",
      "other",
    ]);
    icons.forEach((icon) => expect(icon).toHaveAttribute("aria-hidden", "true"));
    expect(new Set(icons.map((icon) => icon?.innerHTML)).size).toBe(4);
    expect(screen.getByRole("link", { name: "team@x.team" })).toHaveAttribute("href", "mailto:team@x.team");
  });
});
