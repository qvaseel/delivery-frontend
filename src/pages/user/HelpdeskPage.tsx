import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { chatHubService } from "../../shared/lib/chatHub";
import {
  useCreateHelpdeskTicketMutation,
  useHelpdeskUnreadTicketsQuery,
  useMyHelpdeskTicketsQuery,
} from "../../features/helpdesk/helpdeskApi";
import { useHelpdeskUnreadRealtime } from "../../features/helpdesk/lib/useHelpdeskUnreadRealtime";
import { HelpdeskCreateTicketForm } from "../../features/helpdesk/ui/HelpdeskCreateTicketForm";
import { HelpdeskTicketList } from "../../features/helpdesk/ui/HelpdeskTicketList";

export function HelpdeskPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useMyHelpdeskTicketsQuery();
  const { data: unreadTickets = [] } = useHelpdeskUnreadTicketsQuery();
  const [createTicket, { isLoading: isCreating }] =
    useCreateHelpdeskTicketMutation();

  useHelpdeskUnreadRealtime();

  useEffect(() => {
    void chatHubService.ensureConnected().catch(() => {
      toast.error("Не удалось подключить realtime для поддержки");
    });

    const unsubscribeCreated = chatHubService.onHelpdeskTicketCreated(() => {
      void refetch();
    });
    const unsubscribeUpdated = chatHubService.onHelpdeskTicketUpdated(() => {
      void refetch();
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [refetch]);

  const handleCreate = async (values: { subject: string; message: string }) => {
    try {
      const ticket = await createTicket(values).unwrap();
      toast.success(`Тикет #${ticket.id} создан`);
      navigate(`/helpdesk/${ticket.id}`);
    } catch {
      toast.error("Не удалось создать тикет");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">Поддержка</h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Создавайте обращения, следите за ответами и общайтесь с поддержкой в
            одном месте.
          </p>
        </div>

        <Button variant="ghost" onClick={() => refetch()}>
          Обновить
        </Button>
      </div>

      <HelpdeskCreateTicketForm
        loading={isCreating}
        onSubmit={handleCreate}
      />

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">
            Загрузка тикетов...
          </div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Не удалось загрузить список тикетов.
          </div>
        </Card>
      ) : null}

      {data ? (
        <HelpdeskTicketList
          tickets={data}
          basePath="/helpdesk"
          emptyTitle="Тикетов пока нет"
          emptyDescription="Создайте первое обращение, если нужна помощь по заказу или работе сервиса."
          unreadTickets={unreadTickets}
        />
      ) : null}
    </div>
  );
}
