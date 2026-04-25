import { useMemo, useState } from "react";
import { Clock3, LoaderCircle, PackageCheck, ScrollText } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { cn } from "../../../shared/lib/cn";
import { Modal } from "../../../shared/ui/Modal";
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

function getTimelineMessage(
  changedByName: string,
  changedByRole: string,
  previousStatus: 1 | 2 | 3 | 4 | 5 | null,
  newStatus: 1 | 2 | 3 | 4 | 5,
) {
  const actor = `${changedByName} (${getRoleLabel(changedByRole)})`;

  if (previousStatus === null) {
    return `${actor} создал заказ со статусом "${getOrderStatusLabel(newStatus)}"`;
  }

  return `${actor} перевел заказ из "${getOrderStatusLabel(previousStatus)}" в "${getOrderStatusLabel(newStatus)}"`;
}

export function OrderHistoryPanel({ orderId }: OrderHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isFetching, isError } = useOrderHistoryQuery(orderId, {
    skip: !isOpen,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const entriesCount = useMemo(() => data?.length ?? 0, [data]);

  return (
    <>
      <div className="mt-5 border-t border-custom-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-custom-text">
              История статусов
            </div>
            <div className="text-xs text-custom-text-muted">
              {entriesCount > 0
                ? `${entriesCount} событий по этому заказу`
                : "Откройте журнал, чтобы посмотреть все изменения"}
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setIsOpen(true)}
            className="gap-2 px-3 py-1.5 text-xs"
          >
            <ScrollText size={14} />
            Открыть
          </Button>
        </div>
      </div>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={`История заказа #${orderId}`}
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-custom-border bg-custom-surface-soft px-4 py-3 text-sm text-custom-text-muted">
            Здесь собраны все изменения статусов по заказу: кто именно менял
            состояние и в какое время это произошло.
          </div>

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
                    <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-custom-primary/12 text-custom-primary">
                      <PackageCheck size={14} />
                    </span>
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
                      <div className="text-sm font-medium leading-6 text-custom-text">
                        {getTimelineMessage(
                          entry.changedByName,
                          entry.changedByRole,
                          entry.previousStatus,
                          entry.newStatus,
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-custom-text-muted">
                        <Clock3 size={12} />
                        {formatHistoryTime(entry.changedAtUtc)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
