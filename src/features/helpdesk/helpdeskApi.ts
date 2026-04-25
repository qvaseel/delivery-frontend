import { baseApi } from "../../app/baseApi";
import type { PagedResult } from "../products/types";
import {
  normalizeHelpdeskTicket,
  serializeHelpdeskStatus,
} from "./lib/helpdesk.utils";
import type {
  CreateHelpdeskTicketDto,
  HelpdeskTicketMessageDto,
  HelpdeskTicketDto,
  HelpdeskTicketUnread,
  HelpdeskTicketsQuery,
  HelpdeskTicketStatus,
  HelpdeskUnreadCount,
} from "./types";

function normalizeHelpdeskUnreadCount(
  response: Partial<HelpdeskUnreadCount> | null | undefined,
): HelpdeskUnreadCount {
  return {
    unreadTickets: response?.unreadTickets ?? 0,
    unreadMessages: response?.unreadMessages ?? 0,
  };
}

function normalizeHelpdeskUnreadTickets(
  response: Array<Partial<HelpdeskTicketUnread>> | null | undefined,
): HelpdeskTicketUnread[] {
  return (response ?? []).map((item) => ({
    ticketId: item.ticketId ?? 0,
    hasUnread: Boolean(item.hasUnread ?? (item.unreadCount ?? 0) > 0),
    unreadCount: item.unreadCount ?? 0,
  }));
}

export const helpdeskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createHelpdeskTicket: builder.mutation<
      HelpdeskTicketDto,
      CreateHelpdeskTicketDto
    >({
      query: (body) => ({
        url: "/helpdesk/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["HelpdeskTickets", "HelpdeskUnread"],
      transformResponse: normalizeHelpdeskTicket,
    }),
    myHelpdeskTickets: builder.query<HelpdeskTicketDto[], void>({
      query: () => ({ url: "/helpdesk/tickets/my" }),
      providesTags: (result) => [
        "HelpdeskTickets",
        ...(result?.map((ticket) => ({
          type: "HelpdeskTickets" as const,
          id: ticket.id,
        })) ?? []),
      ],
      transformResponse: (response: HelpdeskTicketDto[]) =>
        response.map(normalizeHelpdeskTicket),
    }),
    helpdeskUnreadCount: builder.query<HelpdeskUnreadCount, void>({
      query: () => ({ url: "/helpdesk/unread-count" }),
      providesTags: ["HelpdeskUnread"],
      transformResponse: normalizeHelpdeskUnreadCount,
    }),
    helpdeskUnreadTickets: builder.query<HelpdeskTicketUnread[], void>({
      query: () => ({ url: "/helpdesk/tickets/unread" }),
      providesTags: ["HelpdeskUnread"],
      transformResponse: normalizeHelpdeskUnreadTickets,
    }),
    helpdeskTickets: builder.query<
      PagedResult<HelpdeskTicketDto>,
      HelpdeskTicketsQuery
    >({
      query: (params) => ({
        url: "/helpdesk/tickets",
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
          status: params.status ? serializeHelpdeskStatus(params.status) : undefined,
          assignedEmployeeId: params.assignedEmployeeId ?? undefined,
          customerId: params.customerId ?? undefined,
          search: params.search ?? undefined,
        },
      }),
      providesTags: (result) => [
        "HelpdeskTickets",
        ...(result?.items.map((ticket) => ({
          type: "HelpdeskTickets" as const,
          id: ticket.id,
        })) ?? []),
      ],
      transformResponse: (response: PagedResult<HelpdeskTicketDto>) => ({
        ...response,
        items: response.items.map(normalizeHelpdeskTicket),
      }),
    }),
    helpdeskTicket: builder.query<HelpdeskTicketDto, number>({
      query: (id) => ({ url: `/helpdesk/tickets/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "HelpdeskTickets", id }],
      transformResponse: normalizeHelpdeskTicket,
    }),
    helpdeskTicketMessages: builder.query<
      HelpdeskTicketMessageDto[],
      { id: number; take?: number }
    >({
      query: ({ id, take = 100 }) => ({
        url: `/helpdesk/tickets/${id}/messages`,
        params: { take },
      }),
      providesTags: (_result, _error, { id }) => [
        { type: "HelpdeskMessages", id },
      ],
    }),
    sendHelpdeskMessage: builder.mutation<
      HelpdeskTicketMessageDto,
      { id: number; message: string }
    >({
      query: ({ id, message }) => ({
        url: `/helpdesk/tickets/${id}/messages`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "HelpdeskMessages", id },
        { type: "HelpdeskTickets", id },
        "HelpdeskTickets",
        "HelpdeskUnread",
      ],
    }),
    assignHelpdeskTicket: builder.mutation<
      HelpdeskTicketDto,
      { id: number; employeeId: number }
    >({
      query: ({ id, employeeId }) => ({
        url: `/helpdesk/tickets/${id}/assign/${employeeId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "HelpdeskTickets", id },
        "HelpdeskTickets",
      ],
      transformResponse: normalizeHelpdeskTicket,
    }),
    setHelpdeskTicketStatus: builder.mutation<
      HelpdeskTicketDto,
      { id: number; status: HelpdeskTicketStatus }
    >({
      query: ({ id, status }) => ({
        url: `/helpdesk/tickets/${id}/status`,
        method: "POST",
        params: { status: serializeHelpdeskStatus(status) },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "HelpdeskTickets", id },
        "HelpdeskTickets",
      ],
      transformResponse: normalizeHelpdeskTicket,
    }),
  }),
});

export const {
  useCreateHelpdeskTicketMutation,
  useMyHelpdeskTicketsQuery,
  useHelpdeskUnreadCountQuery,
  useHelpdeskUnreadTicketsQuery,
  useHelpdeskTicketsQuery,
  useHelpdeskTicketQuery,
  useHelpdeskTicketMessagesQuery,
  useSendHelpdeskMessageMutation,
  useAssignHelpdeskTicketMutation,
  useSetHelpdeskTicketStatusMutation,
} = helpdeskApi;
