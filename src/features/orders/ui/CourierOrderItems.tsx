import { formatPrice } from "../../../shared/lib/format";
import type { OrderItemDto } from "../types";

type CourierOrderItemsProps = {
  orderId: number;
  items: OrderItemDto[];
};

export function CourierOrderItems({ orderId, items }: CourierOrderItemsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-custom-border pt-4">
      <div className="text-sm font-semibold text-custom-text">Позиции</div>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={`${orderId}-${item.product.id}`}
            className="flex items-center justify-between rounded-2xl bg-custom-surface-soft px-3 py-2 text-sm"
          >
            <div className="text-custom-text-muted">
              <span className="font-medium text-custom-text">
                {item.product.name}
              </span>{" "}
              × {item.quantity}
            </div>

            <div className="font-semibold text-custom-text">
              {formatPrice(item.lineTotal)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
