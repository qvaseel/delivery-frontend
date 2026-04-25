import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import {
  useCancelOrderMutation,
  useMyOrdersQuery,
  useUnreadOrderChatsQuery,
} from "../../features/orders/ordersApi";
import { useOrderChatUnreadRealtime } from "../../features/orders/lib/useOrderChatUnreadRealtime";
import { canCancelOrder } from "../../features/orders/lib/orders.utils";
import { MyOrderCard } from "../../features/orders/ui/MyOrderCard";

function OrderCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-7 w-36 animate-pulse rounded-full bg-custom-surface-soft" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-custom-surface-soft" />
          </div>
          <div className="h-4 w-4/5 animate-pulse rounded-full bg-custom-surface-soft" />
          <div className="h-4 w-40 animate-pulse rounded-full bg-custom-surface-soft" />
        </div>

        <div className="flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded-2xl bg-custom-surface-soft" />
          <div className="h-10 w-28 animate-pulse rounded-2xl bg-custom-surface-soft" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="h-20 animate-pulse rounded-2xl bg-custom-surface-soft" />
        <div className="h-12 animate-pulse rounded-2xl bg-custom-surface-soft" />
      </div>
    </Card>
  );
}

export function MyOrdersPage() {
  const { data, isLoading, isError, isFetching, refetch } = useMyOrdersQuery();
  const { data: unreadChats = [] } = useUnreadOrderChatsQuery();
  const [cancelOrder] = useCancelOrderMutation();
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  useOrderChatUnreadRealtime();

  const unreadMap = useMemo(
    () => new Map(unreadChats.map((item) => [item.orderId, item])),
    [unreadChats],
  );

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
      toast.success(`Заказ #${id} отменен`);
    } catch {
      toast.error("Не удалось отменить заказ");
    } finally {
      setPendingOrderId(null);
    }
  };

  const showInitialSkeleton = isLoading && sortedOrders.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">
            Мои заказы
          </h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            История заказов, статусы и переписка по доставке в одном месте.
          </p>
        </div>

        <Button variant="ghost" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Обновление..." : "Обновить"}
        </Button>
      </div>

      {showInitialSkeleton ? (
        <div className="space-y-4" aria-hidden="true">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Ошибка загрузки заказов.
          </div>
        </Card>
      ) : null}

      {!showInitialSkeleton && data && data.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">
            У вас пока нет заказов. Перейдите в товары и добавьте что-нибудь в
            корзину.
          </div>
        </Card>
      ) : null}

      {sortedOrders.length > 0 ? (
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            const unreadChat = unreadMap.get(order.id);

            return (
              <MyOrderCard
                key={order.id}
                order={order}
                hasUnreadChat={unreadChat?.hasUnread ?? false}
                unreadChatCount={unreadChat?.unreadCount ?? 0}
                cancelDisabled={pendingOrderId === order.id}
                onCancel={onCancel}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
