import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { baseApi } from "../../../app/baseApi";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getRoleLabel } from "../../../shared/lib/roles";
import { chatHubService } from "../../../shared/lib/chatHub";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { ChatComposer } from "../../../shared/ui/ChatComposer";
import { ChatMessageList } from "../../../shared/ui/ChatMessageList";
import { EmployeeAsyncSelect } from "../../employees/ui/EmployeeAsyncSelect";
import type { SelectOption } from "../../../shared/lib/styles";
import {
  helpdeskApi,
  useAssignHelpdeskTicketMutation,
  useHelpdeskTicketMessagesQuery,
  useHelpdeskTicketQuery,
  useSendHelpdeskMessageMutation,
  useSetHelpdeskTicketStatusMutation,
} from "../helpdeskApi";
import {
  getHelpdeskStatusClassName,
  getHelpdeskStatusLabel,
  HelpdeskTicketStatusEnum,
} from "../lib/helpdesk.utils";
import type {
  HelpdeskTicketMessageDto,
  HelpdeskTicketStatus,
} from "../types";

type HelpdeskTicketDetailsProps = {
  ticketId: number;
};

function mergeMessages(
  serverMessages: HelpdeskTicketMessageDto[],
  liveMessages: HelpdeskTicketMessageDto[],
) {
  const map = new Map<number, HelpdeskTicketMessageDto>();

  [...serverMessages, ...liveMessages].forEach((message) => {
    map.set(message.id, message);
  });

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime(),
  );
}

export function HelpdeskTicketDetails({ ticketId }: HelpdeskTicketDetailsProps) {
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.auth.me);
  const currentUserId = me?.userId ? Number(me.userId) : null;
  const roles = me?.roles ?? [];
  const canManage = roles.includes("Manager") || roles.includes("Admin");
  const hasMarkedReadRef = useRef(false);

  const [liveMessages, setLiveMessages] = useState<HelpdeskTicketMessageDto[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<SelectOption | null>(
    null,
  );

  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
    refetch: refetchTicket,
  } = useHelpdeskTicketQuery(ticketId);

  const {
    data: serverMessages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useHelpdeskTicketMessagesQuery(
    { id: ticketId, take: 100 },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const [sendMessage, { isLoading: isSending }] =
    useSendHelpdeskMessageMutation();
  const [assignTicket, { isLoading: isAssigning }] =
    useAssignHelpdeskTicketMutation();
  const [setStatus, { isLoading: isUpdatingStatus }] =
    useSetHelpdeskTicketStatusMutation();

  useEffect(() => {
    if (!ticket || isMessagesLoading || hasMarkedReadRef.current) return;

    hasMarkedReadRef.current = true;

    dispatch(
      helpdeskApi.util.updateQueryData("helpdeskUnreadCount", undefined, (draft) => {
        draft.unreadTickets = Math.max(
          0,
          draft.unreadTickets - (ticket.hasUnread ? 1 : 0),
        );
        draft.unreadMessages = Math.max(0, draft.unreadMessages - ticket.unreadCount);
      }),
    );
    dispatch(
      helpdeskApi.util.updateQueryData(
        "helpdeskUnreadTickets",
        undefined,
        (draft) => draft.filter((item) => item.ticketId !== ticketId),
      ),
    );
    dispatch(
      helpdeskApi.util.updateQueryData("helpdeskTicket", ticketId, (draft) => {
        draft.hasUnread = false;
        draft.unreadCount = 0;
      }),
    );
    dispatch(baseApi.util.invalidateTags(["HelpdeskUnread"]));
  }, [dispatch, isMessagesLoading, ticket, ticketId]);

  useEffect(() => {
    let unsubscribeMessage: () => void = () => {};
    let unsubscribeUpdated: () => void = () => {};
    let unsubscribeReconnect: () => void = () => {};
    let active = true;

    const connect = async () => {
      try {
        await Promise.all([refetchTicket(), refetchMessages()]);
        await chatHubService.joinHelpdeskTicket(ticketId);
        if (!active) return;

        unsubscribeMessage = chatHubService.onHelpdeskMessage((message) => {
          if (message.ticketId !== ticketId) return;

          setLiveMessages((prev) =>
            prev.some((item) => item.id === message.id) ? prev : [...prev, message],
          );
        });

        unsubscribeUpdated = chatHubService.onHelpdeskTicketUpdated(
          (updatedTicket) => {
            if (updatedTicket.id !== ticketId) return;
            void refetchTicket();
          },
        );

        unsubscribeReconnect = chatHubService.onReconnected(() => {
          void refetchMessages();
          void refetchTicket();
          dispatch(baseApi.util.invalidateTags(["HelpdeskUnread"]));
        });
      } catch {
        toast.error("Не удалось подключиться к тикету");
      }
    };

    void connect();

    return () => {
      active = false;
      unsubscribeMessage();
      unsubscribeUpdated();
      unsubscribeReconnect();
      void chatHubService.leaveHelpdeskTicket(ticketId);
    };
  }, [dispatch, refetchMessages, refetchTicket, ticketId]);

  const messages = useMemo(
    () => mergeMessages(serverMessages, liveMessages),
    [serverMessages, liveMessages],
  );

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    try {
      const createdMessage = await sendMessage({ id: ticketId, message }).unwrap();
      setLiveMessages((prev) =>
        prev.some((item) => item.id === createdMessage.id)
          ? prev
          : [...prev, createdMessage],
      );
      await refetchTicket();
      dispatch(baseApi.util.invalidateTags(["HelpdeskUnread"]));
    } catch {
      toast.error("Не удалось отправить сообщение");
    }
  };

  const handleAssign = async (option: SelectOption | null) => {
    setSelectedEmployee(option);

    const employeeId = Number(option?.value);
    if (!employeeId) return;

    try {
      await assignTicket({ id: ticketId, employeeId }).unwrap();
      toast.success("Сотрудник назначен");
      await refetchTicket();
    } catch {
      toast.error("Не удалось назначить сотрудника");
    }
  };

  const handleStatusChange = async (status: HelpdeskTicketStatus) => {
    try {
      await setStatus({ id: ticketId, status }).unwrap();
      toast.success("Статус тикета обновлен");
      await refetchTicket();
    } catch {
      toast.error("Не удалось обновить статус тикета");
    }
  };

  if (isTicketLoading) {
    return (
      <Card className="p-6">
        <div className="text-sm text-custom-text-muted">Загрузка тикета...</div>
      </Card>
    );
  }

  if (isTicketError || !ticket) {
    return (
      <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
        <div className="text-sm font-medium text-custom-danger">
          Не удалось загрузить карточку тикета.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xl font-semibold text-custom-text">
                Тикет #{ticket.id}
              </div>
              <Badge className={getHelpdeskStatusClassName(ticket.status)}>
                {getHelpdeskStatusLabel(ticket.status)}
              </Badge>
              {ticket.hasUnread ? (
                <Badge className="border-transparent bg-custom-primary/12 text-custom-primary">
                  Новых: {ticket.unreadCount}
                </Badge>
              ) : null}
            </div>
            <div className="mt-2 text-sm text-custom-text-muted">
              Тема:{" "}
              <span className="font-medium text-custom-text">{ticket.subject}</span>
            </div>
            <div className="mt-1 text-sm text-custom-text-muted">
              Клиент:{" "}
              <span className="font-medium text-custom-text">
                {ticket.customer.fullName}
              </span>
            </div>
            <div className="mt-1 text-sm text-custom-text-muted">
              Ответственный:{" "}
              <span className="font-medium text-custom-text">
                {ticket.assignedEmployee
                  ? `${ticket.assignedEmployee.fullName} (${getRoleLabel(ticket.assignedEmployee.role)})`
                  : "Не назначен"}
              </span>
            </div>
          </div>

          {canManage ? (
            <div className="space-y-3 lg:w-[26rem]">
              <div>
                <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
                  Назначить сотрудника
                </div>
                <EmployeeAsyncSelect
                  value={selectedEmployee}
                  onChange={handleAssign}
                  isDisabled={isAssigning}
                />
              </div>

              <div>
                <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
                  Сменить статус
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    HelpdeskTicketStatusEnum.Open,
                    HelpdeskTicketStatusEnum.InProgress,
                    HelpdeskTicketStatusEnum.Resolved,
                    HelpdeskTicketStatusEnum.Closed,
                  ] as const).map((status) => (
                    <Button
                      key={status}
                      variant={ticket.status === status ? "primary" : "ghost"}
                      disabled={isUpdatingStatus}
                      onClick={() => void handleStatusChange(status)}
                    >
                      {getHelpdeskStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {isMessagesError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Не удалось загрузить сообщения тикета.
          </div>
        </Card>
      ) : null}

      {isMessagesLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">
            Загрузка сообщений...
          </div>
        </Card>
      ) : (
        <ChatMessageList
          messages={messages}
          currentUserId={currentUserId}
          emptyTitle="Сообщений пока нет"
          emptyDescription="Начните диалог по тикету, чтобы быстрее решить вопрос."
        />
      )}

      <Card className="p-5">
        <div className="text-sm font-semibold text-custom-text">
          Новое сообщение
        </div>
        <div className="mt-1 text-sm text-custom-text-muted">
          Сообщение увидят все участники тикета сразу после отправки.
        </div>
        <div className="mt-4">
          <ChatComposer
            onSend={handleSend}
            disabled={isSending}
            placeholder="Напишите сообщение в тикет..."
          />
        </div>
      </Card>
    </div>
  );
}
