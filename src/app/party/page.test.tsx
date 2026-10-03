import { render, screen, waitFor } from "@testing-library/react";
import PartyPage from "./page";
import { fetchPartyList } from "@/lib/public-content-client";

jest.mock("@/lib/public-content-client", () => ({
  fetchPartyList: jest.fn(),
}));

const mockedFetchPartyList = fetchPartyList as jest.Mock;

describe("PartyPage", () => {
  beforeEach(() => {
    mockedFetchPartyList.mockReset();
  });

  it("loads active parties of every mode and type on first render", async () => {
    mockedFetchPartyList.mockResolvedValue([]);

    render(<PartyPage />);

    await waitFor(() =>
      expect(mockedFetchPartyList).toHaveBeenCalledWith({
        status: "active",
        format: "all",
        category: "all",
      }),
    );
    expect(await screen.findByText("No parties match the current filters.")).toBeInTheDocument();
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

    render(<PartyPage />);

    expect(await screen.findByText("Results / 02")).toBeInTheDocument();
  });

  it("exposes each filter by its visible label with the current value", async () => {
    mockedFetchPartyList.mockResolvedValue([]);

    render(<PartyPage />);

    expect(await screen.findByRole("combobox", { name: "Status" })).toHaveTextContent("Active");
    expect(screen.getByRole("combobox", { name: "Mode" })).toHaveTextContent("All");
    expect(screen.getByRole("combobox", { name: "Type" })).toHaveTextContent("All");
  });
});
