import { Badge } from "../../../shared/ui/Badge";
import { getOrderStatusLabel } from "../lib/orders.utils";
import type { OrderStatus } from "../types";

export function OrderStatusBadge({
  status,
}: {
  status: Exclude<OrderStatus, "all">;
}) {
  const label = getOrderStatusLabel(status);

  const cls =
    status === 4
      ? "border-transparent bg-custom-success-soft text-custom-success"
      : status === 5
        ? "border-transparent bg-custom-danger-soft text-custom-danger"
        : status === 3
          ? "border-transparent bg-custom-primary/15 text-custom-primary"
          : "border-custom-border bg-custom-surface-soft text-custom-text-muted";

  return <Badge className={cls}>{label}</Badge>;
}
