import { OrderStatusEnum, type OrderDto } from "../types";

function formatMinutesLabel(minutes: number) {
  const mod10 = minutes % 10;
  const mod100 = minutes % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${minutes} минута`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${minutes} минуты`;
  }

  return `${minutes} минут`;
}

export function formatOrderDeliveryDuration(minutes: number) {
  if (minutes < 60) {
    return formatMinutesLabel(minutes);
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  if (remainderMinutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч${remainderMinutes} мин`;
}

export function formatOrderDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function getOrderDeliveryDurationLabel(
  order: Pick<
    OrderDto,
    | "status"
    | "deliveryStartedAtUtc"
    | "deliveredAtUtc"
    | "deliveryDurationMinutes"
  >,
) {
  if (order.deliveryDurationMinutes !== null) {
    return formatOrderDeliveryDuration(order.deliveryDurationMinutes);
  }

  if (
    order.status === OrderStatusEnum.Delivering ||
    (order.deliveryStartedAtUtc && !order.deliveredAtUtc)
  ) {
    return "В процессе";
  }

  return "—";
}
