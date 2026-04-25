import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { canMarkDelivered, canStartDelivery } from "../lib/courierOrders.utils";
import type { OrderDto } from "../types";
import { CourierOrderItems } from "./CourierOrderItems";
import { OrderChat } from "./OrderChat";
import { OrderHistoryPanel } from "./OrderHistoryPanel";
import { OrderStatusBadge } from "./OrderStatusBadge";

type CourierOrderCardProps = {
  order: OrderDto;
  hasUnreadChat?: boolean;
  unreadChatCount?: number;
  disabled: boolean;
  onStartDelivery: (orderId: number) => void;
  onMarkDelivered: (orderId: number) => void;
};

export function CourierOrderCard({
  order,
  hasUnreadChat = false,
  unreadChatCount = 0,
  disabled,
  onStartDelivery,
  onMarkDelivered,
}: CourierOrderCardProps) {
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

          <Button
            disabled={disabled || !canStartDelivery(order.status)}
            onClick={() => onStartDelivery(order.id)}
          >
            Начать доставку
          </Button>

          <Button
            variant="ghost"
            disabled={disabled || !canMarkDelivered(order.status)}
            onClick={() => onMarkDelivered(order.id)}
          >
            Доставлено
          </Button>
        </div>
      </div>

      <CourierOrderItems orderId={order.id} items={order.items} />
      <OrderHistoryPanel orderId={order.id} />
    </Card>
  );
}
