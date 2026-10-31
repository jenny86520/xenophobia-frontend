import { act, render } from "@testing-library/react";
import { PodiumReveal } from "./podium-reveal";

/** A stand-in IntersectionObserver whose callback the test fires by hand. */
let fire: (isIntersecting: boolean) => void = () => {};
class FakeObserver {
  constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
    fire = (isIntersecting) => callback([{ isIntersecting }]);
  }
  observe() {}
  disconnect() {}
}

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = jest.fn().mockReturnValue({ matches: reduce }) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeObserver;
  mockReducedMotion(false);
});

afterEach(() => {
  delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
});

describe("PodiumReveal", () => {
  it("arms the trophies after hydration and shows them once the podium scrolls in", () => {
    const { container } = render(<PodiumReveal>podium</PodiumReveal>);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper).toHaveAttribute("data-podium", "armed");
    act(() => fire(false));
    expect(wrapper).toHaveAttribute("data-podium", "armed");
    act(() => fire(true));
    expect(wrapper).toHaveAttribute("data-podium", "shown");
  });

  it("leaves the trophies alone with reduced motion", () => {
    mockReducedMotion(true);
    const { container } = render(<PodiumReveal>podium</PodiumReveal>);

    expect(container.firstElementChild).not.toHaveAttribute("data-podium");
  });

  it("leaves the trophies alone without IntersectionObserver", () => {
    delete (window as { IntersectionObserver?: unknown }).IntersectionObserver;
    const { container } = render(<PodiumReveal>podium</PodiumReveal>);

    expect(container.firstElementChild).not.toHaveAttribute("data-podium");
  });
});
