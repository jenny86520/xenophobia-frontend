import { act, render, screen } from "@testing-library/react";
import { SCRAMBLE_MS, ScrambleText, scramble } from "./scramble-text";

/** A stand-in IntersectionObserver whose callback the test fires by hand. */
let fireIntersect: (() => void) | null = null;
const disconnect = jest.fn();
class FakeObserver {
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    fireIntersect = () => callback([{ isIntersecting: true }]);
  }
  observe() {}
  disconnect() {
    disconnect();
  }
}

const setMotion = (reduce: boolean) => {
  window.matchMedia = jest.fn().mockReturnValue({ matches: reduce }) as unknown as typeof window.matchMedia;
};

beforeEach(() => {
  jest.useFakeTimers();
  fireIntersect = null;
  disconnect.mockClear();
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeObserver;
  setMotion(false);
});

afterEach(() => {
  jest.useRealTimers();
  delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const glyphLayer = (container: HTMLElement) => container.querySelector('[aria-hidden="true"]');

describe("scramble", () => {
  it("keeps the settled characters, spaces and punctuation, and replaces the rest with glyphs", () => {
    expect(scramble("MATCH / CS2", 2, () => 0)).toBe("MAAAA / AAA");
    expect(scramble("MATCH / CS2", 11, () => 0)).toBe("MATCH / CS2");
  });
});

describe("ScrambleText", () => {
  it("renders only the real text before it scrolls in", () => {
    const { container } = render(<ScrambleText text="PARTY" />);

    expect(container).toHaveTextContent(/^PARTY$/);
    expect(glyphLayer(container)).toBeNull();
  });

  it("decodes once when it scrolls in, keeping the real text for assistive tech, then removes the glyphs", () => {
    const { container } = render(<ScrambleText text="PARTY" />);

    act(() => fireIntersect?.());
    act(() => {
      jest.advanceTimersByTime(32);
    });
    expect(glyphLayer(container)).not.toBeNull();
    expect(screen.getByText("PARTY")).toHaveClass("text-transparent");
    expect(disconnect).toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(SCRAMBLE_MS + 100);
    });
    expect(glyphLayer(container)).toBeNull();
    expect(screen.getByText("PARTY")).not.toHaveClass("text-transparent");
    expect(container).toHaveTextContent(/^PARTY$/);
  });

  it("stays still for visitors who prefer reduced motion", () => {
    setMotion(true);
    const { container } = render(<ScrambleText text="PARTY" />);

    expect(fireIntersect).toBeNull();
    expect(glyphLayer(container)).toBeNull();
  });
});
