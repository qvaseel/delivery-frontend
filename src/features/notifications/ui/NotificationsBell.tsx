import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { cn } from "../../../shared/lib/cn";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../notificationsApi";
import type { NotificationDto } from "../types";

const POLLING_INTERVAL_MS = 5000;

function formatNotificationTime(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getNotificationTitle(notification: NotificationDto) {
  return notification.title?.trim() || "Новое уведомление";
}

function getNotificationMessage(notification: NotificationDto) {
  return notification.message?.trim() || "У вас появилось новое уведомление.";
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    data: notifications = [],
    isFetching: isNotificationsFetching,
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery(undefined, {
    pollingInterval: POLLING_INTERVAL_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: unreadCount = 0,
    isFetching: isUnreadCountFetching,
  } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: POLLING_INTERVAL_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [markNotificationAsRead, { isLoading: isMarkingOne }] =
    useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsAsReadMutation();

  const hasUnread = unreadCount > 0;
  const isBusy = isMarkingOne || isMarkingAll;
  const buttonLabel = useMemo(
    () => (unreadCount > 99 ? "99+" : String(unreadCount)),
    [unreadCount],
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      void refetchNotifications();
    }
  };

  const handleMarkOne = async (notification: NotificationDto) => {
    if (notification.isRead) return;

    await markNotificationAsRead(notification.id).unwrap();
  };

  const handleMarkAll = async () => {
    if (!hasUnread) return;

    await markAllNotificationsAsRead().unwrap();
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        onClick={handleToggle}
        className="relative px-3"
        title="Уведомления"
        aria-label="Уведомления"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={18} />
        {hasUnread ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-custom-primary px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-custom-primary-foreground shadow-sm">
            {buttonLabel}
          </span>
        ) : null}
      </Button>

      {open ? (
        <Card className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-custom-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-custom-text">
                Уведомления
              </div>
              <div className="text-xs text-custom-text-muted">
                {hasUnread
                  ? `Непрочитанных: ${unreadCount}`
                  : "Все уведомления прочитаны"}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => void handleMarkAll()}
              disabled={!hasUnread || isBusy}
              className="gap-2 px-3 py-1.5 text-xs"
              title="Прочитать все"
            >
              {isMarkingAll ? <LoaderCircle size={14} className="animate-spin" /> : <CheckCheck size={14} />}
              Прочитать все
            </Button>
          </div>

          <div className="max-h-[24rem] overflow-y-auto p-2">
            {isNotificationsLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-custom-text-muted">
                <LoaderCircle size={16} className="animate-spin" />
                Загрузка уведомлений...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-custom-text-muted">
                Пока уведомлений нет.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void handleMarkOne(notification)}
                    className={cn(
                      "w-full rounded-2xl border px-3 py-3 text-left transition-colors",
                      notification.isRead
                        ? "border-custom-border bg-transparent hover:bg-custom-surface-soft"
                        : "border-custom-primary/20 bg-custom-surface-soft hover:border-custom-primary/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-custom-text">
                            {getNotificationTitle(notification)}
                          </span>
                          {!notification.isRead ? (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-custom-primary" />
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-custom-text-muted">
                          {getNotificationMessage(notification)}
                        </p>
                      </div>

                      <div className="shrink-0 text-[11px] text-custom-text-muted">
                        {formatNotificationTime(notification.createdAtUtc)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {(isNotificationsFetching || isUnreadCountFetching) && !isNotificationsLoading ? (
            <div className="border-t border-custom-border px-4 py-2 text-xs text-custom-text-muted">
              Обновление...
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
