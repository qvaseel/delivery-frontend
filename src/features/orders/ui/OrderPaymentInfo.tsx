import { getPaymentMethodLabel } from "../lib/orders.utils";
import type { OrderDto } from "../types";

type OrderPaymentInfoProps = {
  order: Pick<OrderDto, "paymentMethod">;
};

export function OrderPaymentInfo({ order }: OrderPaymentInfoProps) {
  return (
    <div className="text-sm text-custom-text-muted">
      Оплата:{" "}
      <span className="font-semibold text-custom-text">
        {getPaymentMethodLabel(order.paymentMethod)}
      </span>
    </div>
  );
}
