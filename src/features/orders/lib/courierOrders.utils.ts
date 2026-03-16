import type { OrderStatus } from "../types";

export const COURIER_ORDER_STATUS = {
  assigned: 2 as OrderStatus,
  delivering: 3 as OrderStatus,
  delivered: 4 as OrderStatus,
};

export const canStartDelivery = (status: OrderStatus) =>
  status === COURIER_ORDER_STATUS.assigned;

export const canMarkDelivered = (status: OrderStatus) =>
  status === COURIER_ORDER_STATUS.delivering;
