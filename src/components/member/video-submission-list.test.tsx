import { render, screen } from "@testing-library/react";
import type { MemberVideoSubmission } from "@/types/member";
import { VideoSubmissionList } from "./video-submission-list";

const submission = (overrides: Partial<MemberVideoSubmission> = {}): MemberVideoSubmission => ({
  id: "s1",
  game: { id: "g1", name: "CS2" },
  otherGameName: "",
  title: "殘局 1v3",
  recordedOn: "2026-10-01",
  source: "youtube",
  youtubeId: "dQw4w9WgXcQ",
  status: "accepted",
  rejectReason: "",
  createdAt: "2026-10-02T00:00:00.000Z",
  reviewedAt: "2026-10-03T00:00:00.000Z",
  takenDown: null,
  ...overrides,
});

describe("VideoSubmissionList", () => {
  it("shows an accepted video as 已接收", () => {
    render(<VideoSubmissionList items={[submission()]} />);

    expect(screen.getByText("已接收")).toBeInTheDocument();
    expect(screen.queryByText(/下架原因/)).toBeNull();
  });

  it("shows 已下架 with the reason once the video is taken down", () => {
    render(<VideoSubmissionList items={[submission({ takenDown: { reason: "侵權" } })]} />);

    expect(screen.getByText("已下架")).toBeInTheDocument();
    expect(screen.queryByText("已接收")).toBeNull();
    expect(screen.getByText("下架原因：侵權")).toBeInTheDocument();
  });
});
