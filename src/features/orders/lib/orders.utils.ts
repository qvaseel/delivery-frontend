import { OrderStatusEnum, type OrderStatus } from "../types";

export const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: 1, label: "Создан" },
  { value: 2, label: "Назначен" },
  { value: 3, label: "В доставке" },
  { value: 4, label: "Доставлен" },
  { value: 5, label: "Отменен" },
];

export const toOptionalNumber = (value: string): number | undefined => {
  if (value.trim() === "") return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const canCancelOrder = (status: number) => {
  return (
    status !== OrderStatusEnum.Delivering &&
    status !== OrderStatusEnum.Delivered &&
    status !== OrderStatusEnum.Canceled
  );
};

export const getOrderStatusLabel = (status: Exclude<OrderStatus, "all">) => {
  if (status === 1) return "Создан";
  if (status === 2) return "Назначен";
  if (status === 3) return "В доставке";
  if (status === 4) return "Доставлен";

  return "Отменен";
};
