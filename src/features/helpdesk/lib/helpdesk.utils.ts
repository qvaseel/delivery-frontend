import type { HelpdeskTicketDto, HelpdeskTicketStatus } from "../types";

export const HelpdeskTicketStatusEnum = {
  Open: 1 as HelpdeskTicketStatus,
  InProgress: 2 as HelpdeskTicketStatus,
  Resolved: 3 as HelpdeskTicketStatus,
  Closed: 4 as HelpdeskTicketStatus,
} as const;

type HelpdeskRawStatus = HelpdeskTicketStatus | "Open" | "InProgress" | "Resolved" | "Closed";

export function normalizeHelpdeskStatus(status: HelpdeskRawStatus): HelpdeskTicketStatus {
  if (status === "Open" || status === HelpdeskTicketStatusEnum.Open) {
    return HelpdeskTicketStatusEnum.Open;
  }
  if (
    status === "InProgress" ||
    status === HelpdeskTicketStatusEnum.InProgress
  ) {
    return HelpdeskTicketStatusEnum.InProgress;
  }
  if (status === "Resolved" || status === HelpdeskTicketStatusEnum.Resolved) {
    return HelpdeskTicketStatusEnum.Resolved;
  }

  return HelpdeskTicketStatusEnum.Closed;
}

export function serializeHelpdeskStatus(
  status: HelpdeskTicketStatus,
): "Open" | "InProgress" | "Resolved" | "Closed" {
  if (status === HelpdeskTicketStatusEnum.Open) return "Open";
  if (status === HelpdeskTicketStatusEnum.InProgress) return "InProgress";
  if (status === HelpdeskTicketStatusEnum.Resolved) return "Resolved";

  return "Closed";
}

export function getHelpdeskStatusLabel(status: HelpdeskTicketStatus) {
  if (status === HelpdeskTicketStatusEnum.Open) return "Открыт";
  if (status === HelpdeskTicketStatusEnum.InProgress) return "В работе";
  if (status === HelpdeskTicketStatusEnum.Resolved) return "Решен";

  return "Закрыт";
}

export function getHelpdeskStatusClassName(status: HelpdeskTicketStatus) {
  if (status === HelpdeskTicketStatusEnum.Resolved) {
    return "border-transparent bg-custom-success-soft text-custom-success";
  }
  if (status === HelpdeskTicketStatusEnum.Closed) {
    return "border-transparent bg-custom-danger-soft text-custom-danger";
  }
  if (status === HelpdeskTicketStatusEnum.InProgress) {
    return "border-transparent bg-custom-primary/15 text-custom-primary";
  }

  return "border-custom-border bg-custom-surface-soft text-custom-text-muted";
}

export function normalizeHelpdeskTicket(
  ticket: Omit<HelpdeskTicketDto, "status" | "hasUnread" | "unreadCount"> & {
    status: HelpdeskRawStatus;
    hasUnread?: boolean;
    unreadCount?: number | null;
  },
): HelpdeskTicketDto {
  return {
    ...ticket,
    status: normalizeHelpdeskStatus(ticket.status),
    hasUnread: Boolean(ticket.hasUnread ?? (ticket.unreadCount ?? 0) > 0),
    unreadCount: ticket.unreadCount ?? 0,
  };
}
