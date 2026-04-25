import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { canCancelOrder } from "../lib/orders.utils";
import type { OrderDto } from "../types";
import { OrderChat } from "./OrderChat";
import { OrderHistoryPanel } from "./OrderHistoryPanel";
import { MyOrderItems } from "./MyOrderItems";
import { OrderStatusBadge } from "./OrderStatusBadge";

type MyOrderCardProps = {
  order: OrderDto;
  hasUnreadChat?: boolean;
  unreadChatCount?: number;
  cancelDisabled: boolean;
  onCancel: (orderId: number, status: number) => void;
};

export function MyOrderCard({
  order,
  hasUnreadChat = false,
  unreadChatCount = 0,
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

        <div className="flex flex-wrap gap-2">
          <OrderChat
            orderId={order.id}
            hasUnread={hasUnreadChat}
            unreadCount={unreadChatCount}
          />

          {canCancel ? (
            <Button
              variant="ghost"
              disabled={cancelDisabled}
              onClick={() => onCancel(order.id, Number(order.status))}
            >
              Отменить
            </Button>
          ) : null}
        </div>
      </div>

      <MyOrderItems orderId={order.id} items={order.items} />
      <OrderHistoryPanel orderId={order.id} />
    </Card>
  );
}
