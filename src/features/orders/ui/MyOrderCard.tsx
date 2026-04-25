import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { canCancelOrder } from "../lib/orders.utils";
import type { OrderDto } from "../types";
import { OrderHistoryPanel } from "./OrderHistoryPanel";
import { MyOrderItems } from "./MyOrderItems";
import { OrderStatusBadge } from "./OrderStatusBadge";

type MyOrderCardProps = {
  order: OrderDto;
  cancelDisabled: boolean;
  onCancel: (orderId: number, status: number) => void;
};

export function MyOrderCard({
  order,
  cancelDisabled,
  onCancel,
}: MyOrderCardProps) {
  const canCancel = canCancelOrder(Number(order.status));

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold text-custom-text">
              Заказ #{order.id}
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="text-sm text-custom-text-muted">
            Адрес: <span className="text-custom-text">{order.address}</span>
          </div>

          <div className="text-sm text-custom-text-muted">
            Итого:{" "}
            <span className="font-semibold text-custom-text">
              {formatPrice(order.totalPrice)}
            </span>
          </div>
        </div>

        {canCancel ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              disabled={cancelDisabled}
              onClick={() => onCancel(order.id, Number(order.status))}
            >
              Отменить
            </Button>
          </div>
        ) : null}
      </div>

      <MyOrderItems orderId={order.id} items={order.items} />
      <OrderHistoryPanel orderId={order.id} />
    </Card>
  );
}
