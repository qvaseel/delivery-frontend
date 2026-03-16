import type { ProductsFiltersState } from "../types";

export const toOptionalNumber = (value: string): number | undefined => {
  if (value.trim() === "") return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const initialProductsFilters: ProductsFiltersState = {
  search: "",
  minPrice: "",
  maxPrice: "",
  inStock: null,
  sortBy: "name",
  desc: false,
  categoryId: "",
};
