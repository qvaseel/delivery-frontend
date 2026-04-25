import { Link } from "react-router-dom";
import { getRoleLabel } from "../../../shared/lib/roles";
import { Badge } from "../../../shared/ui/Badge";
import { Card } from "../../../shared/ui/Card";
import { EmptyState } from "../../../shared/ui/EmptyState";
import {
  getHelpdeskStatusClassName,
  getHelpdeskStatusLabel,
} from "../lib/helpdesk.utils";
import type { HelpdeskTicketDto, HelpdeskTicketUnread } from "../types";

type HelpdeskTicketListProps = {
  tickets: HelpdeskTicketDto[];
  basePath: string;
  emptyTitle: string;
  emptyDescription: string;
  unreadTickets?: HelpdeskTicketUnread[];
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function HelpdeskTicketList({
  tickets,
  basePath,
  emptyTitle,
  emptyDescription,
  unreadTickets = [],
}: HelpdeskTicketListProps) {
  if (tickets.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const unreadMap = new Map(
    unreadTickets.map((ticket) => [ticket.ticketId, ticket]),
  );

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const unreadState = unreadMap.get(ticket.id);
        const hasUnread = unreadState?.hasUnread ?? ticket.hasUnread;
        const unreadCount = unreadState?.unreadCount ?? ticket.unreadCount;

        return (
          <Link key={ticket.id} to={`${basePath}/${ticket.id}`} className="block">
            <Card className="p-5 transition-shadow hover:shadow-[0_10px_30px_rgba(2,6,23,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-custom-text">
                      #{ticket.id} · {ticket.subject}
                    </div>
                    <Badge className={getHelpdeskStatusClassName(ticket.status)}>
                      {getHelpdeskStatusLabel(ticket.status)}
                    </Badge>
                    {hasUnread ? (
                      <Badge className="border-transparent bg-custom-primary/12 text-custom-primary">
                        Новых: {unreadCount}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-2 text-sm text-custom-text-muted">
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

                <div className="text-sm text-custom-text-muted">
                  <div>Создан: {formatDate(ticket.createdAtUtc)}</div>
                  <div className="mt-1">
                    Последнее сообщение: {formatDate(ticket.lastMessageAtUtc)}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
