import { act, render, screen } from "@testing-library/react";
import { StepCountdown, VETO_REFRESH_MS, VetoAutoRefresh } from "./veto-live";

const refresh = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const setVisibility = (state: DocumentVisibilityState) =>
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });

beforeEach(() => {
  jest.useFakeTimers();
  refresh.mockClear();
  setVisibility("visible");
});

afterEach(() => {
  jest.useRealTimers();
});

describe("VetoAutoRefresh", () => {
  it("refreshes the page every few seconds while the veto is on and the tab is visible", () => {
    render(<VetoAutoRefresh active />);
    act(() => jest.advanceTimersByTime(VETO_REFRESH_MS * 2));
    expect(refresh).toHaveBeenCalledTimes(2);

    setVisibility("hidden");
    act(() => jest.advanceTimersByTime(VETO_REFRESH_MS * 3));
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("does nothing when the veto is not on, and stops once it ends", () => {
    const { rerender } = render(<VetoAutoRefresh active={false} />);
    act(() => jest.advanceTimersByTime(VETO_REFRESH_MS * 2));
    expect(refresh).not.toHaveBeenCalled();

    rerender(<VetoAutoRefresh active />);
    act(() => jest.advanceTimersByTime(VETO_REFRESH_MS));
    rerender(<VetoAutoRefresh active={false} />);
    act(() => jest.advanceTimersByTime(VETO_REFRESH_MS * 3));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

describe("StepCountdown", () => {
  it("counts down to the deadline, then says time is up and a random ban is coming", () => {
    jest.setSystemTime(new Date("2026-10-26T10:00:00.000Z"));
    render(<StepCountdown deadline="2026-10-26T10:00:05.000Z" overdue={false} />);
    act(() => jest.advanceTimersByTime(0));
    expect(screen.getByText("剩 5 秒")).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText("剩 2 秒")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText("時間到，即將隨機 Ban")).toBeInTheDocument();
  });
});
