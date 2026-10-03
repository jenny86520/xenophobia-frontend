import { render, screen } from "@testing-library/react";
import PartyDetailPage from "./page";
import { fetchPartyDetail } from "@/lib/public-content-client";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "missing" }),
}));

jest.mock("@/lib/public-content-client", () => ({
  fetchPartyDetail: jest.fn(),
}));

const mockedFetchPartyDetail = fetchPartyDetail as jest.Mock;

describe("PartyDetailPage", () => {
  it("shows a not-found message with a link back to the list when the party does not exist", async () => {
    mockedFetchPartyDetail.mockResolvedValue(null);

    render(<PartyDetailPage />);

    expect(await screen.findByText("Party not found.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to party list/ })).toHaveAttribute("href", "/party");
  });

  it("shows an error message with a link back to the list when loading fails", async () => {
    mockedFetchPartyDetail.mockRejectedValue(new Error("HTTP 500"));

    render(<PartyDetailPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load this party.");
    expect(screen.getByRole("link", { name: /Back to party list/ })).toHaveAttribute("href", "/party");
  });
});
