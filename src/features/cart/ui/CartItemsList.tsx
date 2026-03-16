import { Card } from "../../../shared/ui/Card";
import type { CartRow } from "../types";
import { CartItemCard } from "./CartItemCard";

type CartItemsListProps = {
  rows: CartRow[];
  isLoading: boolean;
  isError: boolean;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number) => void;
};

export function CartItemsList({
  rows,
  isLoading,
  isError,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemsListProps) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">
            Загрузка товаров...
          </div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Ошибка загрузки товаров для корзины.
          </div>
        </Card>
      ) : null}

      {!isLoading &&
        rows.map((row) => (
          <CartItemCard
            key={row.product.id}
            row={row}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onRemove={onRemove}
          />
        ))}
    </div>
  );
}
