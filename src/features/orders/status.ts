import type { OrderStatus } from "./types";

export function canTransition(current: OrderStatus, next: OrderStatus, assignedEmployeeId?: number | null) {
  if (current === 4 || current === 5) return false;

  const ok =
    (current === 1 && (next === 2 || next === 5)) ||
    (current === 2 && (next === 3 || next === 5)) ||
    (current === 3 && (next === 4 || next === 5));

  if (!ok) return false;

  // Delivering/Delivered требуют курьера
  if ((next === 3 || next === 4) && !assignedEmployeeId) return false;

  return true;
}