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
};

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
