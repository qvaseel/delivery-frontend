import { baseApi } from "../../app/baseApi";
import type { PagedResult } from "../products/types";
import type {
  CreateOrderDto,
  OrderDto,
  OrderListQuery,
  OrderStatus,
} from "./types";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myOrders: builder.query<OrderDto[], void>({
      query: () => ({ url: "/orders/my" }),
      providesTags: ["Orders"],
    }),

    createOrder: builder.mutation<OrderDto, CreateOrderDto>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Orders"],
    }),

    cancelOrder: builder.mutation<OrderDto, number>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["Orders"],
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
      invalidatesTags: ["Orders"],
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
      invalidatesTags: ["Orders"],
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
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useMyOrdersQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useAssignedToMeQuery,
  useSetStatusCourierMutation,
  useAllOrdersQuery,
  useAssignCourierMutation,
  useSetStatusManagerMutation,
} = ordersApi;
