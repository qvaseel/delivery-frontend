import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import {
  useCancelOrderMutation,
  useMyOrdersQuery,
} from "../../features/orders/ordersApi";
import { canCancelOrder } from "../../features/orders/lib/orders.utils";
import { MyOrderCard } from "../../features/orders/ui/MyOrderCard";

export function MyOrdersPage() {
  const { data, isLoading, isError, refetch } = useMyOrdersQuery();
  const [cancelOrder] = useCancelOrderMutation();
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const sortedOrders = useMemo(() => {
    return (data ?? []).slice().sort((a, b) => b.id - a.id);
  }, [data]);

  const onCancel = async (id: number, status: number) => {
    if (!canCancelOrder(status)) {
      toast.error("Этот заказ нельзя отменить");
      return;
    }

    try {
      setPendingOrderId(id);
      await cancelOrder(id).unwrap();
      toast.success(`Заказ #${id} отменён`);
    } catch {
      toast.error("Не удалось отменить заказ");
    } finally {
      setPendingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">
            Мои заказы
          </h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            История заказов, статусы и отмена (если доступно).
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
            Ошибка загрузки заказов.
          </div>
        </Card>
      ) : null}

      {data && data.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">
            У тебя пока нет заказов. Перейди в Товары и добавь что-нибудь в
            корзину
          </div>
        </Card>
      ) : null}

      {sortedOrders.length > 0 ? (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <MyOrderCard
              key={order.id}
              order={order}
              cancelDisabled={pendingOrderId === order.id}
              onCancel={onCancel}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
