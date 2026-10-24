import { cn } from "./utils";

describe("cn", () => {
  it("keeps a design-system text size next to a text colour", () => {
    expect(cn("font-mono text-meta text-ink-muted uppercase")).toBe("font-mono text-meta text-ink-muted uppercase");
    expect(cn("text-body", "text-ink")).toBe("text-body text-ink");
  });

  it("still lets a later size or colour win", () => {
    expect(cn("text-meta", "text-body")).toBe("text-body");
    expect(cn("text-ink-muted", "text-signal")).toBe("text-signal");
    expect(cn("text-sm", "text-caption")).toBe("text-caption");
  });
});
