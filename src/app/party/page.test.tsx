import { render, screen } from "@testing-library/react";
import PartyPage from "./page";
import { fetchPartyList } from "@/lib/public-content-client";

jest.mock("@/lib/public-content-client", () => ({
  fetchPartyList: jest.fn(),
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockedFetchPartyList = fetchPartyList as jest.Mock;

async function renderPage(searchParams: Record<string, string> = {}) {
  return render(await PartyPage({ searchParams: Promise.resolve(searchParams), params: Promise.resolve({}) }));
}

describe("PartyPage", () => {
  beforeEach(() => {
    mockedFetchPartyList.mockReset();
    mockReplace.mockReset();
  });

  it("loads active parties of every mode and type by default", async () => {
    mockedFetchPartyList.mockResolvedValue([]);

    await renderPage();

    expect(mockedFetchPartyList).toHaveBeenCalledWith("active", "all", "all");
    expect(screen.getByText("沒有符合目前篩選條件的活動。")).toBeInTheDocument();
  });

  it("renders the filters from the URL", async () => {
    mockedFetchPartyList.mockResolvedValue([]);

    await renderPage({ status: "expired", format: "offline" });

    expect(mockedFetchPartyList).toHaveBeenCalledWith("expired", "offline", "all");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Expired");
    expect(screen.getByRole("combobox", { name: "Mode" })).toHaveTextContent("Offline");
  });

  it("falls back to the default for an invalid URL value", async () => {
    mockedFetchPartyList.mockResolvedValue([]);

    await renderPage({ status: "unknown" });

    expect(mockedFetchPartyList).toHaveBeenCalledWith("active", "all", "all");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Active");
  });

  it("shows the number of matching parties as RESULTS metadata", async () => {
    const party = {
      title: "Party",
      description: "Description",
      category: "games",
      format: "offline",
      status: "active",
      startDate: "2026-11-01",
      startTime: "19:00",
      location: "Taipei",
      summary: "Summary",
    };
    mockedFetchPartyList.mockResolvedValue([
      { ...party, id: "1" },
      { ...party, id: "2" },
    ]);

    await renderPage();

    expect(screen.getByText("Results / 02")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Party/ })).toHaveLength(2);
  });

  it("exposes each filter by its visible label with the current value", async () => {
    mockedFetchPartyList.mockResolvedValue([]);

    await renderPage();

    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Active");
    expect(screen.getByRole("combobox", { name: "Mode" })).toHaveTextContent("All");
    expect(screen.getByRole("combobox", { name: "Type" })).toHaveTextContent("All");
  });
});
