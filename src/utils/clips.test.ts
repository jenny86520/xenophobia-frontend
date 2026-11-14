import {
  clipsHref,
  nextVote,
  parseClipQuery,
  reportBlockedReason,
  voteBlockedReason,
} from "./clips";

describe("parseClipQuery", () => {
  it("reads the game, sort and page, falling back to the defaults", () => {
    expect(parseClipQuery({})).toEqual({
      gameId: null,
      sort: "newest",
      page: 1,
    });
    expect(parseClipQuery({ game: "g1", sort: "popular", page: "3" })).toEqual({
      gameId: "g1",
      sort: "popular",
      page: 3,
    });
    expect(parseClipQuery({ game: "", sort: "likes", page: "0" })).toEqual({
      gameId: null,
      sort: "newest",
      page: 1,
    });
    expect(parseClipQuery({ game: ["a", "b"], page: "x" })).toEqual({
      gameId: null,
      sort: "newest",
      page: 1,
    });
  });
});

describe("clipsHref", () => {
  it("leaves the defaults out", () => {
    expect(clipsHref({ gameId: null, sort: "newest", page: 1 })).toBe("/clips");
    expect(clipsHref({ gameId: "g 1", sort: "popular", page: 2 })).toBe(
      "/clips?game=g+1&sort=popular&page=2",
    );
  });

  it("round-trips through parseClipQuery", () => {
    const query = { gameId: "g1", sort: "popular" as const, page: 4 };
    const params = Object.fromEntries(
      new URLSearchParams(clipsHref(query).split("?")[1]),
    );
    expect(parseClipQuery(params)).toEqual(query);
  });
});

describe("nextVote", () => {
  it("takes the same vote back and switches to the other one", () => {
    expect(nextVote(null, "like")).toBe("like");
    expect(nextVote("like", "like")).toBeNull();
    expect(nextVote("like", "dislike")).toBe("dislike");
    expect(nextVote("dislike", "dislike")).toBeNull();
  });
});

describe("blocked reasons", () => {
  it("explains a paused or denied feature and says nothing when allowed", () => {
    expect(voteBlockedReason("allowed")).toBeNull();
    expect(voteBlockedReason("paused")).toBe("影片按讚目前暫停");
    expect(voteBlockedReason("denied")).toBe("目前的角色不能對影片按讚");
    expect(reportBlockedReason("paused")).toBe("影片檢舉目前暫停");
    expect(reportBlockedReason("denied")).toBe("目前的角色不能檢舉影片");
  });
});
