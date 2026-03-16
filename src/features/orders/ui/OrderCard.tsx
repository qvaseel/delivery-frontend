import { useState } from "react";
import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { canTransition } from "../status";
import type { OrderDto, OrderStatus } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { CourierAsyncSelect } from "../../employees/ui/CourierAsyncSelect";
import type { SelectOption } from "../../../shared/lib/styles";

type OrderCardProps = {
  order: OrderDto;
  isAdmin: boolean;
  includeItems: boolean;
  isAssigning: boolean;
  isSettingStatus: boolean;
  onAssign: (orderId: number, employeeId: number) => Promise<void>;
  onStatusChange: (orderId: number, status: OrderStatus) => Promise<void>;
};

export function OrderCard({
  order,
  isAdmin,
  includeItems,
  isAssigning,
  isSettingStatus,
  onAssign,
  onStatusChange,
}: OrderCardProps) {
  const [selectedCourier, setSelectedCourier] = useState<SelectOption | null>(
    null,
  );

  const handleCourierChange = async (option: SelectOption | null) => {
    setSelectedCourier(option);

    const employeeId = Number(option?.value);
    if (!employeeId) return;

    await onAssign(order.id, employeeId);
    setSelectedCourier(null);
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
            Клиент:{" "}
            <span className="font-semibold text-custom-text">
              {order.customer.fullName}
            </span>
          </div>

          <div className="text-sm text-custom-text-muted">
            Курьер:{" "}
            <span className="font-semibold text-custom-text">
              {order.employee ? order.employee.fullName : "—"}
            </span>
          </div>

          <div className="text-sm text-custom-text-muted">
            Итого:{" "}
            <span className="font-semibold text-custom-text">
              {formatPrice(order.totalPrice)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[320px]">
          <div className="text-sm font-semibold text-custom-text">Действия</div>

          {isAdmin ? (
            <CourierAsyncSelect
              value={selectedCourier}
              onChange={handleCourierChange}
              isDisabled={isAssigning}
            />
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              variant={order.status === 5 ? "danger" : "ghost"}
              disabled={
                isSettingStatus ||
                !canTransition(
                  order.status,
                  5,
                  order.employee ? order.employee.id : 0,
                )
              }
              onClick={() => onStatusChange(order.id, 5)}
            >
              Отмена
            </Button>

            <Button
              variant={order.status === 2 ? "primary" : "ghost"}
              disabled={
                isSettingStatus ||
                !canTransition(
                  order.status,
                  2,
                  order.employee ? order.employee.id : 0,
                )
              }
              onClick={() => onStatusChange(order.id, 2)}
            >
              Назначен
            </Button>

            <Button
              variant={order.status === 3 ? "primary" : "ghost"}
              disabled={
                isSettingStatus ||
                !canTransition(
                  order.status,
                  3,
                  order.employee ? order.employee.id : 0,
                )
              }
              onClick={() => onStatusChange(order.id, 3)}
            >
              В доставке
            </Button>

            <Button
              variant={order.status === 4 ? "primary" : "ghost"}
              disabled={
                isSettingStatus ||
                !canTransition(
                  order.status,
                  4,
                  order.employee ? order.employee.id : 0,
                )
              }
              onClick={() => onStatusChange(order.id, 4)}
            >
              Доставлен
            </Button>
          </div>
        </div>
      </div>

      {includeItems && order.items?.length ? (
        <div className="mt-5 border-t border-custom-border pt-4">
          <div className="text-sm font-semibold text-custom-text">Позиции</div>

          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div
                key={`${order.id}-${item.product.id}`}
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
      ) : null}
    </Card>
  );
}
