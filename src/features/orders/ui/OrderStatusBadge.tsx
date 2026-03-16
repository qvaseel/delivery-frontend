import { Badge } from "../../../shared/ui/Badge";
import type { OrderStatus } from "../types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label =
    status === 1
      ? "Создан"
      : status === 2
        ? "Назначен"
        : status === 3
          ? "В доставке"
          : status === 4
            ? "Доставлен"
            : "Отменён";

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
