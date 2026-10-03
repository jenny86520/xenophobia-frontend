import { contactHref } from "./contact";

const entry = (type: string, value: string) => ({ id: "1", label: "x", type, value });

describe("contactHref", () => {
  it("maps each contact type to a link target", () => {
    expect(contactHref(entry("email", "team@x.team"))).toBe("mailto:team@x.team");
    expect(contactHref(entry("phone", "+886 2-1234-5678"))).toBe("tel:+886212345678");
    expect(contactHref(entry("website", "https://x.team"))).toBe("https://x.team");
    expect(contactHref(entry("social", "https://discord.gg/x"))).toBe("https://discord.gg/x");
  });

  it("renders non-URL values and type other as plain text", () => {
    expect(contactHref(entry("social", "@xpa"))).toBeNull();
    expect(contactHref(entry("other", "https://x.team"))).toBeNull();
  });
});
