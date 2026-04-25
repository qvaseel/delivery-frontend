import { useEffect, useMemo, useRef, useState } from "react";
import { MessagesSquare } from "lucide-react";
import toast from "react-hot-toast";
import { baseApi } from "../../../app/baseApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { chatHubService } from "../../../shared/lib/chatHub";
import { Button } from "../../../shared/ui/Button";
import { ChatComposer } from "../../../shared/ui/ChatComposer";
import { ChatMessageList } from "../../../shared/ui/ChatMessageList";
import { Modal } from "../../../shared/ui/Modal";
import {
  ordersApi,
  useOrderChatMessagesQuery,
  useSendOrderChatMessageMutation,
} from "../ordersApi";
import type { OrderChatMessageDto } from "../types";

type OrderChatProps = {
  orderId: number;
  unreadCount?: number;
  hasUnread?: boolean;
};

function mergeMessages(
  serverMessages: OrderChatMessageDto[],
  liveMessages: OrderChatMessageDto[],
) {
  const map = new Map<number, OrderChatMessageDto>();

  [...serverMessages, ...liveMessages].forEach((message) => {
    map.set(message.id, message);
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime(),
  );
}

export function OrderChat({
  orderId,
  unreadCount = 0,
  hasUnread = false,
}: OrderChatProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [liveMessages, setLiveMessages] = useState<OrderChatMessageDto[]>([]);
  const hasMarkedReadRef = useRef(false);
  const me = useAppSelector((state) => state.auth.me);
  const currentUserId = me?.userId ? Number(me.userId) : null;

  const {
    data: serverMessages = [],
    isLoading,
    isError,
    refetch,
  } = useOrderChatMessagesQuery(
    { orderId, take: 50 },
    {
      skip: !open,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const [sendMessage, { isLoading: isSending }] =
    useSendOrderChatMessageMutation();

  useEffect(() => {
    if (!open || isLoading || hasMarkedReadRef.current) return;

    hasMarkedReadRef.current = true;

    dispatch(
      ordersApi.util.updateQueryData("orderChatUnreadCount", undefined, (draft) => {
        draft.unreadOrders = Math.max(0, draft.unreadOrders - (hasUnread ? 1 : 0));
        draft.unreadMessages = Math.max(0, draft.unreadMessages - unreadCount);
      }),
    );
    dispatch(
      ordersApi.util.updateQueryData("unreadOrderChats", undefined, (draft) =>
        draft.filter((item) => item.orderId !== orderId),
      ),
    );
    dispatch(baseApi.util.invalidateTags(["OrderChatUnread"]));
  }, [dispatch, hasUnread, isLoading, open, orderId, unreadCount]);

  useEffect(() => {
    if (!open) return;

    let unsubscribeMessage: () => void = () => {};
    let unsubscribeReconnect: () => void = () => {};
    let active = true;

    const connect = async () => {
      try {
        await refetch();
        await chatHubService.joinOrderChat(orderId);
        if (!active) return;

        unsubscribeMessage = chatHubService.onOrderMessage((message) => {
          if (message.orderId !== orderId) return;

          setLiveMessages((prev) =>
            prev.some((item) => item.id === message.id) ? prev : [...prev, message],
          );
        });

        unsubscribeReconnect = chatHubService.onReconnected(() => {
          void refetch();
          dispatch(baseApi.util.invalidateTags(["OrderChatUnread"]));
        });
      } catch {
        toast.error("Не удалось подключиться к чату заказа");
      }
    };

    void connect();

    return () => {
      active = false;
      unsubscribeMessage();
      unsubscribeReconnect();
      void chatHubService.leaveOrderChat(orderId);
    };
  }, [dispatch, open, orderId, refetch]);

  const messages = useMemo(
    () => mergeMessages(serverMessages, liveMessages),
    [serverMessages, liveMessages],
  );

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    try {
      const createdMessage = await sendMessage({ orderId, message }).unwrap();
      setLiveMessages((prev) =>
        prev.some((item) => item.id === createdMessage.id)
          ? prev
          : [...prev, createdMessage],
      );
      dispatch(baseApi.util.invalidateTags(["OrderChatUnread"]));
    } catch {
      toast.error("Не удалось отправить сообщение");
    }
  };

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <>
      <Button
        variant="ghost"
        className="relative gap-2"
        onClick={() => {
          hasMarkedReadRef.current = false;
          setLiveMessages([]);
          setOpen(true);
        }}
      >
        <MessagesSquare size={16} />
        Чат заказа
        {hasUnread ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-custom-primary px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-custom-primary-foreground shadow-sm">
            {badgeLabel}
          </span>
        ) : null}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Чат заказа #${orderId}`}
        className="max-w-3xl"
      >
        <div className="space-y-4">
          {isError ? (
            <div className="rounded-2xl border border-custom-danger/20 bg-custom-danger-soft px-4 py-4 text-sm text-custom-danger">
              Не удалось загрузить сообщения заказа.
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-2xl border border-custom-border bg-custom-surface-soft px-4 py-4 text-sm text-custom-text-muted">
              Загрузка сообщений...
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              currentUserId={currentUserId}
              emptyTitle="Сообщений пока нет"
              emptyDescription="Начните переписку по заказу, если нужно уточнить детали доставки."
            />
          )}

          <ChatComposer
            onSend={handleSend}
            disabled={isSending}
            placeholder="Напишите сообщение по заказу..."
          />
        </div>
      </Modal>
    </>
  );
}
