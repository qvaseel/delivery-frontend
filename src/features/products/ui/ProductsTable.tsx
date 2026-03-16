import { API_URL } from "../../../shared/lib/constants";
import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import type { ProductDto } from "../types";

type ProductsTableProps = {
  items: ProductDto[];
  categoryMap: Map<number, string>;
  deleting: boolean;
  onEdit: (product: ProductDto) => void;
  onDelete: (id: number) => void;
};

export function ProductsTable({
  items,
  categoryMap,
  deleting,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-12 border-b border-custom-border bg-custom-surface-soft px-4 py-3 text-xs font-semibold uppercase tracking-wide text-custom-text-muted">
        <div className="col-span-3">Товар</div>
        <div className="col-span-2">Категория</div>
        <div className="col-span-2">Цена</div>
        <div className="col-span-2">Кол-во на складе</div>
        <div className="col-span-3 text-right">Действия</div>
      </div>

      {items.map((product, index) => {
        const imageSrc = product.imageUrl
          ? `${API_URL}${product.imageUrl}`
          : null;

        return (
          <div
            key={product.id}
            className={[
              "grid grid-cols-12 items-center gap-3 px-4 py-3",
              index !== items.length - 1 ? "border-b border-custom-border" : "",
            ].join(" ")}
          >
            <div className="col-span-3 flex items-center gap-3">
              <div className="h-12 w-16 overflow-hidden rounded-xl bg-custom-surface-soft">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-custom-text-subtle">
                    Нет фото
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="font-semibold text-custom-text">
                  {product.name}
                </div>
                <div className="line-clamp-1 text-xs text-custom-text-muted">
                  {product.description}
                </div>
              </div>
            </div>

            <div className="col-span-2 text-sm font-semibold text-custom-text">
              {categoryMap.get(product.categoryId) ?? `#${product.categoryId}`}
            </div>

            <div className="col-span-2 text-sm font-semibold text-custom-text">
              {formatPrice(product.price)}
            </div>

            <div className="col-span-2 text-sm text-custom-text">
              {product.stockQuantity}
            </div>

            <div className="col-span-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => onEdit(product)}>
                Редактировать
              </Button>

              <Button
                variant="ghost"
                onClick={() => onDelete(product.id)}
                disabled={deleting}
              >
                Удалить
              </Button>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
