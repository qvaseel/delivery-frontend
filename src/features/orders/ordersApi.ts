import { baseApi } from "../../app/baseApi";
import type { PagedResult } from "../products/types";
import type {
  CreateOrderDto,
  OrderChatMessageDto,
  OrderChatUnread,
  OrderChatUnreadCount,
  OrderDto,
  OrderListQuery,
  OrderStatusHistoryDto,
  OrderStatus,
} from "./types";

function normalizeOrderChatUnreadCount(
  response: Partial<OrderChatUnreadCount> | null | undefined,
): OrderChatUnreadCount {
  return {
    unreadOrders: response?.unreadOrders ?? 0,
    unreadMessages: response?.unreadMessages ?? 0,
  };
}

function normalizeOrderChatUnreadList(
  response: Array<Partial<OrderChatUnread>> | null | undefined,
): OrderChatUnread[] {
  return (response ?? []).map((item) => ({
    orderId: item.orderId ?? 0,
    hasUnread: Boolean(item.hasUnread ?? (item.unreadCount ?? 0) > 0),
    unreadCount: item.unreadCount ?? 0,
  }));
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myOrders: builder.query<OrderDto[], void>({
      query: () => ({ url: "/orders/my" }),
      providesTags: ["Orders"],
    }),
    orderHistory: builder.query<OrderStatusHistoryDto[], number>({
      query: (id) => ({ url: `/orders/${id}/history` }),
      providesTags: (_result, _error, id) => [{ type: "OrderHistory", id }],
    }),
    orderChatUnreadCount: builder.query<OrderChatUnreadCount, void>({
      query: () => ({ url: "/orders/chat/unread-count" }),
      providesTags: ["OrderChatUnread"],
      transformResponse: normalizeOrderChatUnreadCount,
    }),
    unreadOrderChats: builder.query<OrderChatUnread[], void>({
      query: () => ({ url: "/orders/chat/unread" }),
      providesTags: ["OrderChatUnread"],
      transformResponse: normalizeOrderChatUnreadList,
    }),
    orderChatMessages: builder.query<
      OrderChatMessageDto[],
      { orderId: number; take?: number }
    >({
      query: ({ orderId, take = 50 }) => ({
        url: `/orders/${orderId}/chat/messages`,
        params: { take },
      }),
      providesTags: (_result, _error, { orderId }) => [
        { type: "OrderChat", id: orderId },
      ],
    }),

    createOrder: builder.mutation<OrderDto, CreateOrderDto>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Orders", "OrderHistory"],
    }),

    cancelOrder: builder.mutation<OrderDto, number>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        "Orders",
        { type: "OrderHistory", id },
        { type: "OrderChat", id },
        "OrderChatUnread",
      ],
    }),
    sendOrderChatMessage: builder.mutation<
      OrderChatMessageDto,
      { orderId: number; message: string }
    >({
      query: ({ orderId, message }) => ({
        url: `/orders/${orderId}/chat/messages`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "OrderChat", id: orderId },
        "OrderChatUnread",
      ],
    }),

    assignedToMe: builder.query<
      PagedResult<OrderDto>,
      { page?: number; pageSize?: number }
    >({
      query: (q) => ({
        url: "/orders/assigned",
        params: { page: q.page ?? 1, pageSize: q.pageSize ?? 20 },
      }),
      providesTags: ["Orders"],
    }),

    setStatusCourier: builder.mutation<
      OrderDto,
      { id: number; status: OrderStatus }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status/courier`,
        method: "POST",
        params: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Orders",
        { type: "OrderHistory", id },
        { type: "OrderChat", id },
        "OrderChatUnread",
      ],
    }),
    allOrders: builder.query<PagedResult<OrderDto>, OrderListQuery>({
      query: (q) => ({
        url: "/orders",
        params: {
          status: q.status ?? undefined,
          customerId: q.customerId ?? undefined,
          assignedEmployeeId: q.assignedEmployeeId ?? undefined,
          createdFromUtc: q.createdFromUtc ?? undefined,
          createdToUtc: q.createdToUtc ?? undefined,
          minTotal: q.minTotal ?? undefined,
          maxTotal: q.maxTotal ?? undefined,
          addressSearch: q.addressSearch ?? undefined,
          sortBy: q.sortBy ?? "createdAt",
          desc: typeof q.desc === "boolean" ? q.desc : true,
          page: q.page ?? 1,
          pageSize: q.pageSize ?? 20,
          includeItems:
            typeof q.includeItems === "boolean" ? q.includeItems : false,
        },
      }),
      providesTags: ["Orders"],
    }),
    assignCourier: builder.mutation<
      OrderDto,
      { orderId: number; employeeId: number }
    >({
      query: ({ orderId, employeeId }) => ({
        url: `/orders/${orderId}/assign/${employeeId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        "Orders",
        { type: "OrderHistory", id: orderId },
        { type: "OrderChat", id: orderId },
        "OrderChatUnread",
      ],
    }),

    setStatusManager: builder.mutation<
      OrderDto,
      { orderId: number; status: OrderStatus }
    >({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: "POST",
        params: { status },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        "Orders",
        { type: "OrderHistory", id: orderId },
        { type: "OrderChat", id: orderId },
        "OrderChatUnread",
      ],
    }),
  }),
});

export const {
  useMyOrdersQuery,
  useOrderHistoryQuery,
  useOrderChatUnreadCountQuery,
  useUnreadOrderChatsQuery,
  useOrderChatMessagesQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useSendOrderChatMessageMutation,
  useAssignedToMeQuery,
  useSetStatusCourierMutation,
  useAllOrdersQuery,
  useAssignCourierMutation,
  useSetStatusManagerMutation,
} = ordersApi;
