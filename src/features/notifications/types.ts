export type NotificationDto = {
  id: number;
  title?: string | null;
  message?: string | null;
  isRead: boolean;
  createdAtUtc?: string | null;
};
