import { contactHref, splitAfterSeparators } from "./contact";

const entry = (type: string, value: string) => ({ id: "1", label: "x", type, value });

describe("contactHref", () => {
  it("maps each contact type to a link target", () => {
    expect(contactHref(entry("email", "team@x.team"))).toBe("mailto:team@x.team");
    expect(contactHref(entry("phone", "+886 2-1234-5678"))).toBe("tel:+886212345678");
    expect(contactHref(entry("website", "https://x.team"))).toBe("https://x.team");
  });

  it("renders non-URL values and type other as plain text", () => {
    expect(contactHref(entry("website", "xpa.team"))).toBeNull();
    expect(contactHref(entry("other", "https://x.team"))).toBeNull();
  });
});

describe("splitAfterSeparators", () => {
  it("cuts after each @ and dot, keeping the text", () => {
    expect(splitAfterSeparators("xpagchannel@gmail.com")).toEqual(["xpagchannel@", "gmail.", "com"]);
    expect(splitAfterSeparators("https://discord.gg/x")).toEqual(["https://discord.", "gg/x"]);
    expect(splitAfterSeparators("xpagchannel@gmail.com").join("")).toBe("xpagchannel@gmail.com");
  });

  it("leaves values without separators whole", () => {
    expect(splitAfterSeparators("0912345678")).toEqual(["0912345678"]);
    expect(splitAfterSeparators("")).toEqual([]);
  });
});
