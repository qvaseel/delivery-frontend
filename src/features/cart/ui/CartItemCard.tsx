import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { InlineQty } from "../../../shared/ui/InlineQty";
import type { CartRow } from "../types";

type CartItemCardProps = {
  row: CartRow;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number) => void;
};

export function CartItemCard({
  row,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemCardProps) {
  const { cartItem, product } = row;

  const incDisabled = cartItem.quantity >= product.stockQuantity;
  const decDisabled = cartItem.quantity <= 1;
  const hasStockIssue = cartItem.quantity > product.stockQuantity;

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-base font-semibold text-custom-text">
            {product.name}
          </div>

          <div className="mt-1 text-sm text-custom-text-muted">
            {formatPrice(product.price)} На складе:{" "}
            <span className="font-semibold text-custom-text">
              {product.stockQuantity}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          <InlineQty
            value={cartItem.quantity}
            onDec={() => onDecrement(product.id)}
            onInc={() => onIncrement(product.id)}
            incDisabled={incDisabled}
            decDisabled={decDisabled}
          />

          <div className="min-w-28 text-right text-sm font-semibold text-custom-text">
            {formatPrice(product.price * cartItem.quantity)}
          </div>

          <Button variant="ghost" onClick={() => onRemove(product.id)}>
            Удалить
          </Button>
        </div>
      </div>

      {hasStockIssue ? (
        <div className="mt-4 rounded-2xl border border-custom-danger/30 bg-custom-danger-soft px-3 py-2 text-sm font-medium text-custom-danger">
          Количество превышает остаток на складе.
        </div>
      ) : null}
    </Card>
  );
}
