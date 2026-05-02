import type { CustomerDto } from "../customers/types";
import type { ChatAttachment } from "../../shared/lib/attachments";

export type HelpdeskTicketStatus = 1 | 2 | 3 | 4;

export type HelpdeskUnreadCount = {
  unreadTickets: number;
  unreadMessages: number;
};

export type HelpdeskTicketUnread = {
  ticketId: number;
  hasUnread: boolean;
  unreadCount: number;
};

export type HelpdeskAssignedEmployeeDto = {
  id: number;
  userId: number;
  fullName: string;
  role: string;
  email: string;
} | null;

export type HelpdeskTicketDto = {
  id: number;
  subject: string;
  status: HelpdeskTicketStatus;
  customer: CustomerDto;
  assignedEmployee: HelpdeskAssignedEmployeeDto;
  lastMessageAtUtc: string;
  createdAtUtc: string;
  hasUnread: boolean;
  unreadCount: number;
};

export type HelpdeskTicketMessageDto = {
  id: number;
  ticketId: number;
  senderUserId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAtUtc: string;
  attachments?: ChatAttachment[];
};

export type CreateHelpdeskTicketDto = {
  subject: string;
  message?: string;
  files?: File[];
};

export type SendHelpdeskMessageDto = {
  message?: string;
  files?: File[];
};

export type HelpdeskTicketsQuery = {
  page?: number;
  pageSize?: number;
  status?: HelpdeskTicketStatus;
  assignedEmployeeId?: number;
  customerId?: number;
  search?: string;
};
