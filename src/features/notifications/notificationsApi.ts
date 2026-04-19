import { baseApi } from "../../app/baseApi";
import type { NotificationDto } from "./types";

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationDto[], void>({
      query: () => ({ url: "/notifications" }),
      providesTags: (result) => [
        "Notifications",
        ...(result?.map((notification) => ({
          type: "Notifications" as const,
          id: notification.id,
        })) ?? []),
      ],
    }),
    getUnreadNotificationsCount: builder.query<number, void>({
      query: () => ({ url: "/notifications/unread-count" }),
      providesTags: ["Notifications"],
      transformResponse: (response: number | { count?: number; unreadCount?: number }) =>
        typeof response === "number"
          ? response
          : (response.unreadCount ?? response.count ?? 0),
    }),
    markNotificationAsRead: builder.mutation<void, number>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [
        "Notifications",
        { type: "Notifications", id },
      ],
    }),
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "POST" }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApi;
