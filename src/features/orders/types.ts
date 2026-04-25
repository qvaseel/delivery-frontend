import type { CustomerDto } from "../customers/types";
import type { EmployeeDto, EmployeeRole } from "../employees/types";
import type { ProductDto } from "../products/types";

export type OrderStatus = 1 | 2 | 3 | 4 | 5 | "all";

export const OrderStatusEnum = {
  Created: 1 as OrderStatus,
  Assigned: 2 as OrderStatus,
  Delivering: 3 as OrderStatus,
  Delivered: 4 as OrderStatus,
  Canceled: 5 as OrderStatus,
} as const;

export type OrderItemDto = {
  product: ProductDto;
  quantity: number;
  lineTotal: number;
};

export type OrderDto = {
  id: number;
  status: Exclude<OrderStatus, "all">;
  address: string;
  customer: CustomerDto;
  employee: EmployeeDto;
  totalPrice: number;
  imageUrl?: string | null | undefined;
  items: OrderItemDto[];
  createdAtUtc: string;
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

export type CreateOrderDto = {
  address: string;
  items: { productId: number; quantity: number }[];
};

export type OrderListQuery = {
  status?: 1 | 2 | 3 | 4 | 5;
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
