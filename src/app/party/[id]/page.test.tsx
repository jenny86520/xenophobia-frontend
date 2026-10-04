import { render, screen } from "@testing-library/react";
import PartyDetailPage from "./page";
import PartyNotFound from "./not-found";
import PartyDetailError from "./error";
import { fetchPartyDetail } from "@/lib/public-content-client";

const NOT_FOUND = new Error("NEXT_NOT_FOUND");
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
}));

jest.mock("@/lib/public-content-client", () => ({
  fetchPartyDetail: jest.fn(),
}));

const mockedFetchPartyDetail = fetchPartyDetail as jest.Mock;

const party = {
  id: "1",
  title: "Night of Strategy",
  description: "A tabletop evening.",
  summary: "Strategy night.",
  category: "games",
  format: "offline",
  status: "active",
  startDate: "2026-09-30",
  startTime: "18:30",
  location: "Red Room Studio, Taipei",
  createdBy: "Admin Team",
  createdAt: "2026-10-01",
};

const renderPage = async (id = "1") =>
  render(await PartyDetailPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }));

describe("PartyDetailPage", () => {
  beforeEach(() => mockedFetchPartyDetail.mockReset());

  it("calls notFound() when the party does not exist", async () => {
    mockedFetchPartyDetail.mockResolvedValue(null);
    await expect(renderPage("missing")).rejects.toBe(NOT_FOUND);
  });

  it("lets a backend failure reach the error boundary", async () => {
    mockedFetchPartyDetail.mockRejectedValue(new Error("HTTP 500"));
    await expect(renderPage()).rejects.toThrow("HTTP 500");
  });

  const subParty = (overrides: Record<string, unknown>) => ({
    id: "s1",
    title: "Setup and greetings",
    description: "Check-in",
    startDateTime: "2026-09-30T18:30:00+08:00",
    location: "",
    coverUrl: null,
    ...overrides,
  });

  it("renders the title, metadata and the sub-parties in order with fixed-format times", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      subParties: [
        subParty({}),
        subParty({ id: "s2", title: "Game rounds", description: "Sessions", startDateTime: "2026-09-30T19:00:00+08:00" }),
      ],
    });

    await renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Night of Strategy" })).toBeInTheDocument();
    expect(screen.getByText("Red Room Studio, Taipei")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "子派對" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Setup and greetings",
      "Game rounds",
    ]);
    expect(screen.getAllByRole("listitem").map((li) => li.querySelector("time")?.textContent)).toEqual([
      "09/30 18:30",
      "09/30 19:00",
    ]);
  });

  it("shows the party cover with its alt text, and a sub-party's address and cover only when set", async () => {
    mockedFetchPartyDetail.mockResolvedValue({
      ...party,
      coverUrl: "/media/images/party.jpg",
      subParties: [
        subParty({ location: "台北市信義區", coverUrl: "/media/images/sub.png" }),
        subParty({ id: "s2", title: "Game rounds" }),
      ],
    });

    await renderPage();

    expect(screen.getByRole("img", { name: "Night of Strategy 封面" }).getAttribute("src")).toMatch(
      /\/media\/images\/party\.jpg$/,
    );
    const [withExtras, plain] = screen.getAllByRole("listitem");
    expect(withExtras).toHaveTextContent("台北市信義區");
    expect(withExtras.querySelector("img")).toHaveAttribute("alt", "Setup and greetings 封面");
    expect(plain).not.toHaveTextContent("Where");
    expect(plain.querySelector("img")).toBeNull();
  });

  it("has no cover image when the party has none", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ ...party, coverUrl: null, subParties: [] });

    await renderPage();

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("omits the sub-party section when there are none", async () => {
    mockedFetchPartyDetail.mockResolvedValue({ ...party, coverUrl: null, subParties: [] });

    await renderPage();

    expect(screen.queryByRole("heading", { name: "子派對" })).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("party detail fallbacks", () => {
  it("not-found shows the message with a link back to the list", () => {
    render(<PartyNotFound />);
    expect(screen.getByText("Party not found.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /返回活動列表/ })).toHaveAttribute("href", "/party");
  });

  it("error shows the message with a link back to the list", () => {
    render(<PartyDetailError error={new Error("x")} reset={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load this party.");
    expect(screen.getByRole("link", { name: /返回活動列表/ })).toHaveAttribute("href", "/party");
  });
});
