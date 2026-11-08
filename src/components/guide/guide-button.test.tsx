import { render, screen, within } from "@testing-library/react";
import type { Guide } from "@/types/guide";
import { GuideButton } from "./guide-button";

const guide: Guide = {
  ref: "checkin",
  title: "每日簽到",
  content: "每天按一次「簽到」。",
  imageUrl: null,
  imageAlt: "每日簽到",
  video: { source: "youtube", youtubeId: "dQw4w9WgXcQ" },
};

describe("GuideButton", () => {
  it("renders nothing while the guide is not published", () => {
    const { container } = render(<GuideButton guide={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("opens the guide in a popover dialog with its video and a link to its page", () => {
    render(<GuideButton guide={guide} />);

    const button = screen.getByRole("button", { name: "怎麼玩？" });
    const dialog = document.getElementById(button.getAttribute("popovertarget") ?? "") as HTMLElement;
    expect(dialog).toHaveAttribute("popover", "auto");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(within(dialog).getByRole("heading", { name: "每日簽到" })).toBeInTheDocument();
    expect(within(dialog).getByTitle("每日簽到教學影片")).toHaveAttribute("loading", "lazy");
    expect(within(dialog).getByText("每天按一次「簽到」。")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "看完整手冊" })).toHaveAttribute("href", "/guide/checkin");
  });
});
