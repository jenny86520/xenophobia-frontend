import { render, screen } from "@testing-library/react";
import { ContactList } from "./contact-list";

describe("ContactList", () => {
  it("lists contacts in the given order, linking what can be linked", () => {
    render(
      <ContactList
        contacts={[
          { id: "1", label: "Email", type: "email", value: "team@x.team" },
          { id: "2", label: "Discord", type: "social", value: "https://discord.gg/x" },
          { id: "3", label: "LINE", type: "other", value: "@xpa" },
        ]}
      />,
    );

    expect(screen.getAllByRole("term").map((dt) => dt.textContent)).toEqual(["Email", "Discord", "LINE"]);
    expect(screen.getByRole("link", { name: "team@x.team" })).toHaveAttribute("href", "mailto:team@x.team");
    const discord = screen.getByRole("link", { name: /discord\.gg/ });
    expect(discord).toHaveAttribute("rel", "noopener noreferrer");
    expect(discord).toHaveAttribute("target", "_blank");
    expect(screen.getByText("@xpa").closest("a")).toBeNull();
  });
});
