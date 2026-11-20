import {
  cosmeticTabs,
  kindSections,
  parseHideOwned,
  parseShopCategory,
  sectionsFor,
  shopCosmeticsHref,
  shownGroups,
  zoneSections,
} from "./shop-cosmetics";

const zones = [
  { id: "limited", name: "限定" },
  { id: "collab", name: "聯名" },
  { id: "spring", name: "新春" },
];

const item = (id: string, kind: string, categoryIds: string[], owned: boolean | null = false) => ({
  id,
  kind,
  categoryIds,
  owned,
});

// 2 titles, 1 frame, 2 cups; a title and a cup in 限定, the frame in 聯名, nothing in 新春 or stamps.
const items = [
  item("t1", "title", ["limited"]),
  item("t2", "title", [], true),
  item("f1", "frame", ["collab", "gone-zone"]),
  item("c1", "cup", ["limited"], null),
  item("c2", "cup", [], null),
];

describe("cosmeticTabs", () => {
  it("lists the zones in their order, then the kinds, leaving out empty tabs", () => {
    const tabs = cosmeticTabs(zones, items);
    expect(tabs.map((g) => [g.key, g.label, g.items.map((i) => i.id)])).toEqual([
      ["limited", "限定", ["t1", "c1"]],
      ["collab", "聯名", ["f1"]],
      ["title", "稱號", ["t1", "t2"]],
      ["frame", "比賽室框", ["f1"]],
      ["cup", "冰炫風杯", ["c1", "c2"]],
    ]);
  });

  it("has only kind tabs without zones, and none without items", () => {
    expect(cosmeticTabs([], items).map((g) => g.key)).toEqual(["title", "frame", "cup"]);
    expect(cosmeticTabs(zones, [])).toEqual([]);
  });

  it("treats an older backend's items without zones as in no zone", () => {
    expect(cosmeticTabs(zones, [{ id: "x", kind: "title", owned: false }]).map((g) => g.key)).toEqual(["title"]);
  });
});

describe("kindSections", () => {
  it("puts each item once, under its kind, in shelf order", () => {
    const sections = kindSections(items);
    expect(sections.map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([
      ["title", ["t1", "t2"]],
      ["frame", ["f1"]],
      ["cup", ["c1", "c2"]],
    ]);
    expect(sections.flatMap((g) => g.items)).toHaveLength(items.length);
  });
});

describe("parseShopCategory", () => {
  const tabs = cosmeticTabs(zones, items);

  it("accepts a zone or a kind that has items", () => {
    expect(parseShopCategory("limited", tabs)).toBe("limited");
    expect(parseShopCategory("cup", tabs)).toBe("cup");
  });

  it("falls back to 全部 for anything missing, unknown, empty or the old 其他", () => {
    expect(parseShopCategory(undefined, tabs)).toBe("all");
    expect(parseShopCategory("abc", tabs)).toBe("all");
    expect(parseShopCategory("spring", tabs)).toBe("all");
    expect(parseShopCategory("stamp", tabs)).toBe("all");
    expect(parseShopCategory("other", tabs)).toBe("all");
    expect(parseShopCategory(["limited"], tabs)).toBe("all");
  });
});

describe("parseHideOwned", () => {
  it("hides owned items only for a signed-in member asking for it", () => {
    expect(parseHideOwned("hide", true)).toBe(true);
    expect(parseHideOwned("hide", false)).toBe(false);
    expect(parseHideOwned(undefined, true)).toBe(false);
    expect(parseHideOwned("yes", true)).toBe(false);
  });
});

describe("zoneSections", () => {
  const stamps = [
    item("s1", "stamp", []),
    item("s2", "stamp", ["collab", "limited"]),
    item("s3", "stamp", ["gone-zone"]),
    item("s4", "stamp", ["limited"]),
    item("t1", "title", ["limited"]),
  ];

  it("puts 其他 first, then the zones in their order, an item in two zones in both", () => {
    expect(zoneSections("stamp", zones, stamps).map((g) => [g.key, g.label, g.items.map((i) => i.id)])).toEqual([
      ["none", "其他", ["s1", "s3"]],
      ["limited", "限定", ["s2", "s4"]],
      ["collab", "聯名", ["s2"]],
    ]);
  });

  it("has only 其他 without zones, and leaves out empty sections", () => {
    expect(zoneSections("stamp", [], stamps).map((g) => [g.key, g.items.length])).toEqual([["none", 4]]);
    expect(zoneSections("title", zones, stamps).map((g) => g.key)).toEqual(["limited"]);
    expect(zoneSections("cup", zones, stamps)).toEqual([]);
  });
});

describe("sectionsFor", () => {
  const tabs = cosmeticTabs(zones, items);

  it("gives 全部 the kind sections, a kind its zone sections and a zone its own tab", () => {
    expect(sectionsFor("all", zones, items, tabs).map((g) => g.key)).toEqual(["title", "frame", "cup"]);
    expect(sectionsFor("cup", zones, items, tabs).map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([
      ["none", ["c2"]],
      ["limited", ["c1"]],
    ]);
    expect(sectionsFor("limited", zones, items, tabs).map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([
      ["limited", ["t1", "c1"]],
    ]);
  });
});

describe("shownGroups", () => {
  const tabs = cosmeticTabs(zones, items);

  it("keeps every section without hiding", () => {
    expect(shownGroups(kindSections(items), false).map((g) => g.key)).toEqual(["title", "frame", "cup"]);
  });

  it("hides owned collectibles but never cups, dropping sections left empty", () => {
    const titles = sectionsFor("title", zones, items, tabs);
    expect(shownGroups(titles, true).map((g) => [g.key, g.items.map((i) => i.id)])).toEqual([["limited", ["t1"]]]);
    const cups = sectionsFor("cup", zones, items, tabs);
    expect(shownGroups(cups, true).map((g) => g.items.map((i) => i.id))).toEqual([["c2"], ["c1"]]);
    expect(shownGroups([{ key: "title", label: "稱號", items: [item("t2", "title", [], true)] }], true)).toEqual([]);
  });

  it("does not change the tabs' own counts", () => {
    shownGroups(tabs, true);
    expect(tabs.find((g) => g.key === "title")?.items).toHaveLength(2);
  });
});

describe("shopCosmeticsHref", () => {
  it("keeps the tab and the toggle and lands on the shelf", () => {
    expect(shopCosmeticsHref("all", false)).toBe("/shop#shelf-cosmetics");
    expect(shopCosmeticsHref("cup", false)).toBe("/shop?category=cup#shelf-cosmetics");
    expect(shopCosmeticsHref("limited", true)).toBe("/shop?category=limited&owned=hide#shelf-cosmetics");
    expect(shopCosmeticsHref("all", true)).toBe("/shop?owned=hide#shelf-cosmetics");
  });
});
