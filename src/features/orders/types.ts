import type { CustomerDto } from "../customers/types";
import type { EmployeeDto, EmployeeRole } from "../employees/types";
import type { ProductDto } from "../products/types";
import type { ChatAttachment } from "../../shared/lib/attachments";

export type OrderStatus = 1 | 2 | 3 | 4 | 5 | "all";
export type PaymentMethod = 1 | 2 | 3;
export type PaymentMethodFilter = PaymentMethod | "all";

export const OrderStatusEnum = {
  Created: 1 as OrderStatus,
  Assigned: 2 as OrderStatus,
  Delivering: 3 as OrderStatus,
  Delivered: 4 as OrderStatus,
  Canceled: 5 as OrderStatus,
} as const;

export const PaymentMethodEnum = {
  Cash: 1 as PaymentMethod,
  Card: 2 as PaymentMethod,
  Online: 3 as PaymentMethod,
} as const;

export type OrderItemDto = {
  product: ProductDto;
  quantity: number;
  lineTotal: number;
};

export type OrderDto = {
  id: number;
  status: Exclude<OrderStatus, "all">;
  paymentMethod: number;
  address: string;
  customer: CustomerDto;
  employee: EmployeeDto;
  totalPrice: number;
  imageUrl?: string | null | undefined;
  items: OrderItemDto[];
  createdAtUtc: string;
  deliveryStartedAtUtc: string | null;
  deliveredAtUtc: string | null;
  deliveryDurationMinutes: number | null;
};

export type OrderStatusHistoryDto = {
  id: number;
  previousStatus: Exclude<OrderStatus, "all"> | null;
  newStatus: Exclude<OrderStatus, "all">;
  changedByUserId: number | null;
  changedByName: string;
  changedByRole: string;
  changedAtUtc: string;
};

export type OrderChatUnreadCount = {
  unreadOrders: number;
  unreadMessages: number;
};

export type OrderChatUnread = {
  orderId: number;
  hasUnread: boolean;
  unreadCount: number;
};

export type OrderChatMessageDto = {
  id: number;
  orderId: number;
  senderUserId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAtUtc: string;
  attachments?: ChatAttachment[];
};

export type CreateOrderDto = {
  address: string;
  paymentMethod: PaymentMethod;
  items: { productId: number; quantity: number }[];
};

export type OrderListQuery = {
  status?: 1 | 2 | 3 | 4 | 5;
  paymentMethod?: PaymentMethod;
  customerId?: number;
  assignedEmployeeId?: number;

  createdFromUtc?: string;
  createdToUtc?: string;

  minTotal?: number;
  maxTotal?: number;

  addressSearch?: string;

  sortBy?: "createdAt" | "total";
  desc?: boolean;

  page?: number;
  pageSize?: number;

  includeItems?: boolean;
};

export type OrdersFiltersState = {
  status: OrderStatus | "all";
  paymentMethod: PaymentMethodFilter;
  addressSearch: string;
  assignedEmployeeId: string;
  customerId: string;
  minTotal: string;
  maxTotal: string;
  sortBy: "createdAt" | "total";
  desc: boolean;
  includeItems: boolean;
};

export type OrderStatusOption = {
  value: OrderStatus | "all";
  label: string;
};

export type EmployeeOption = {
  value: string;
  label: string;
  employee: {
    id: number;
    fullName: string;
    role: EmployeeRole;
  };
};
