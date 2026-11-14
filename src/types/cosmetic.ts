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
  /** The admins' shop category; null (or missing from older backends) = 未分類, shown under 其他. */
  categoryId?: string | null;
};

/** One of the admins' cosmetic categories (the shop's tabs), in display order. */
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
