import type { OrderDto } from "../types";
import {
  formatOrderDateTime,
  getOrderDeliveryDurationLabel,
} from "../lib/orderDelivery";

type OrderDeliveryInfoProps = {
  order: Pick<
    OrderDto,
    | "status"
    | "deliveryStartedAtUtc"
    | "deliveredAtUtc"
    | "deliveryDurationMinutes"
  >;
};

export function OrderDeliveryInfo({ order }: OrderDeliveryInfoProps) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-custom-text-muted">
        Время доставки:{" "}
        <span className="font-semibold text-custom-text">
          {getOrderDeliveryDurationLabel(order)}
        </span>
      </div>

      {order.deliveryStartedAtUtc ? (
        <div className="text-sm text-custom-text-muted">
          Начало доставки:{" "}
          <span className="text-custom-text">
            {formatOrderDateTime(order.deliveryStartedAtUtc)}
          </span>
        </div>
      ) : null}

      {order.deliveredAtUtc ? (
        <div className="text-sm text-custom-text-muted">
          Завершение доставки:{" "}
          <span className="text-custom-text">
            {formatOrderDateTime(order.deliveredAtUtc)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
