/** Template parameters as the backend validated them (colours are #rrggbb). */
export type CosmeticParams = Record<string, string | boolean | null>;

/** How one cosmetic looks: the template code and its params; stamps add their image URL (a backend path). */
export type CosmeticLook = { template: string; params: CosmeticParams; imageUrl: string | null };

/** The cup on an ice cream token. */
export type CupView = { name: string; template: string; params: CosmeticParams };

export type CosmeticKind = "title" | "frame" | "stamp" | "cup";

/** A shop card: `owned` for collectibles and `stock` for cups, null for visitors. */
export type ShopCosmetic = {
  id: string;
  kind: CosmeticKind;
  name: string;
  price: number;
  look: CosmeticLook;
  owned: boolean | null;
  stock: number | null;
  /** Copies sold at most site-wide; null = unlimited (older backends send nothing). */
  stockLimit?: number | null;
  /** Copies left to sell; null = unlimited (older backends send nothing). */
  remaining?: number | null;
  /** Last Taiwan day on sale (YYYY-MM-DD); null = no end. */
  saleEndsOn?: string | null;
  /** Every copy is sold: no buy button. */
  soldOut?: boolean;
  /** When it goes on sale (an instant); null = on sale already (older backends send nothing). */
  saleStartsAt?: string | null;
  /** A teaser before its start: shown with the start time, never with a buy button. */
  upcoming?: boolean;
  /** The admins' shop zones, in their order; [] (or missing from older backends) = none. */
  categoryIds?: string[];
};

/** One of the admins' shop zones (a tab before the kinds), in display order. */
export type ShopCosmeticCategory = { id: string; name: string };

export type OwnedCosmetic = {
  id: string;
  kind: Exclude<CosmeticKind, "cup">;
  name: string;
  look: CosmeticLook;
  onSale: boolean;
  equipped: boolean;
};

export type CupStock = { item: { id: string } & CupView; count: number };

/** GET /api/member/cosmetics. */
export type CosmeticCollection = { owned: OwnedCosmetic[]; cups: CupStock[] };
