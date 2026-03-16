import type { ProductDto } from "../types";
import { ProductCard } from "./ProductCard";

type ProductsGridProps = {
  items: ProductDto[];
  categoryMap: Map<number, string>;
};

export function ProductsGrid({ items, categoryMap }: ProductsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap.get(product.categoryId)}
        />
      ))}
    </div>
  );
}
