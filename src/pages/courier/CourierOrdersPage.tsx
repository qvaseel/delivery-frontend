import { useState } from "react";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Pagination } from "../../shared/ui/Pagination";
import {
  useAssignedToMeQuery,
  useSetStatusCourierMutation,
} from "../../features/orders/ordersApi";
import { COURIER_ORDER_STATUS } from "../../features/orders/lib/courierOrders.utils";
import { CourierOrderCard } from "../../features/orders/ui/CourierOrderCard";

export function CourierOrdersPage() {
  const [page, setPage] = useState(1);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const pageSize = 10;

  const { data, isLoading, isError, refetch } = useAssignedToMeQuery({
    page,
    pageSize,
  });

  const [setStatus] = useSetStatusCourierMutation();

  const updateStatus = async (
    orderId: number,
    status: (typeof COURIER_ORDER_STATUS)[keyof typeof COURIER_ORDER_STATUS],
    successMessage: string,
  ) => {
    try {
      setPendingOrderId(orderId);
      await setStatus({ id: orderId, status }).unwrap();
      toast.success(successMessage);
    } catch {
      toast.error("Не удалось сменить статус");
    } finally {
      setPendingOrderId(null);
    }
  };

  const startDelivery = (orderId: number) =>
    updateStatus(
      orderId,
      COURIER_ORDER_STATUS.delivering,
      `Заказ #${orderId}: в доставке`,
    );

  const markDelivered = (orderId: number) =>
    updateStatus(
      orderId,
      COURIER_ORDER_STATUS.delivered,
      `Заказ #${orderId}: доставлен`,
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">
            Курьер: мои заказы
          </h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Здесь только заказы, назначенные тебе. Можно менять статус: Assigned
            → Delivering → Delivered.
          </p>
        </div>

        <Button variant="ghost" onClick={() => refetch()}>
          Обновить
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">Загрузка...</div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Ошибка загрузки. Проверь роль Courier и JWT.
          </div>
        </Card>
      ) : null}

      {data && data.items.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">
            Пока нет назначенных заказов.
          </div>
        </Card>
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.items.map((order) => (
              <CourierOrderCard
                key={order.id}
                order={order}
                disabled={pendingOrderId === order.id}
                onStartDelivery={startDelivery}
                onMarkDelivered={markDelivered}
              />
            ))}
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  );
}
