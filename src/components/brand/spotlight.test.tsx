import { act, render } from "@testing-library/react";
import { Spotlight } from "./spotlight";

function cards() {
  return (
    <Spotlight>
      <div data-spotlight data-testid="a" />
      <div data-spotlight data-testid="b" />
    </Spotlight>
  );
}

/** jsdom has no PointerEvent; a MouseEvent named pointermove carries the coordinates. */
const pointerAt = (target: Element, x: number, y: number) =>
  act(() => {
    target.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: x, clientY: y }));
  });

const flushFrame = () => act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe("Spotlight", () => {
  it("does nothing on touch screens or without matchMedia", async () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    const { container, getByTestId } = render(cards());

    await pointerAt(getByTestId("a"), 40, 20);
    await flushFrame();
    expect(container.firstElementChild).not.toHaveAttribute("data-spot-on");
    expect(getByTestId("a").style.getPropertyValue("--spot-x")).toBe("");
  });

  it("follows a fine pointer: positions every card's light and switches it on, off when it leaves", async () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { container, getByTestId } = render(cards());
    const root = container.firstElementChild as HTMLElement;

    await pointerAt(getByTestId("a"), 40, 20);
    await flushFrame();
    expect(root).toHaveAttribute("data-spot-on");
    for (const id of ["a", "b"]) {
      expect(getByTestId(id).style.getPropertyValue("--spot-x")).toBe("40px");
      expect(getByTestId(id).style.getPropertyValue("--spot-y")).toBe("20px");
    }

    await act(() => {
      root.dispatchEvent(new MouseEvent("pointerleave"));
    });
    expect(root).not.toHaveAttribute("data-spot-on");
  });

  it("stops listening when it unmounts", async () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { container, unmount } = render(cards());
    const root = container.firstElementChild as HTMLElement;
    const remove = jest.spyOn(root, "removeEventListener");

    unmount();
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("pointerleave", expect.any(Function));
  });
});
