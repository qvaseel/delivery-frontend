import { useState } from "react";
import { ChevronDown, ChevronUp, Clock3, LoaderCircle } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { cn } from "../../../shared/lib/cn";
import { getOrderStatusLabel } from "../lib/orders.utils";
import { useOrderHistoryQuery } from "../ordersApi";

type OrderHistoryPanelProps = {
  orderId: number;
};

function formatHistoryTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getRoleLabel(role: string) {
  if (role === "Admin") return "Администратор";
  if (role === "Manager") return "Менеджер";
  if (role === "Courier") return "Курьер";
  if (role === "Customer") return "Клиент";

  return role;
}

export function OrderHistoryPanel({ orderId }: OrderHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isFetching, isError } = useOrderHistoryQuery(orderId, {
    skip: !isOpen,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  return (
    <div className="mt-5 border-t border-custom-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-custom-text">
            История статусов
          </div>
          <div className="text-xs text-custom-text-muted">
            Кто и когда менял состояние заказа
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setIsOpen((value) => !value)}
          className="gap-2 px-3 py-1.5 text-xs"
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isOpen ? "Скрыть" : "Показать"}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-2xl bg-custom-surface-soft px-4 py-4 text-sm text-custom-text-muted">
              <LoaderCircle size={16} className="animate-spin" />
              Загрузка истории...
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-custom-danger/20 bg-custom-danger-soft px-4 py-4 text-sm text-custom-danger">
              Не удалось загрузить историю статусов.
            </div>
          ) : !data || data.length === 0 ? (
            <div className="rounded-2xl bg-custom-surface-soft px-4 py-4 text-sm text-custom-text-muted">
              История статусов пока пуста.
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((entry, index) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex w-5 flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-custom-primary" />
                    {index !== data.length - 1 ? (
                      <span className="mt-2 h-full w-px bg-custom-border" />
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "flex-1 rounded-2xl border border-custom-border bg-custom-surface-soft px-4 py-3",
                      isFetching && "opacity-80",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-custom-text">
                        {entry.previousStatus === null
                          ? `Заказ создан со статусом "${getOrderStatusLabel(entry.newStatus)}"`
                          : `Статус изменен: "${getOrderStatusLabel(entry.previousStatus)}" -> "${getOrderStatusLabel(entry.newStatus)}"`}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-custom-text-muted">
                        <Clock3 size={12} />
                        {formatHistoryTime(entry.changedAtUtc)}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-custom-text-muted">
                      {entry.changedByName} ({getRoleLabel(entry.changedByRole)})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
