import Select from "react-select";
import type { OrderStatus } from "../types";
import { statusOptions } from "../lib/orders.utils";
import {
  classNamesSelect,
  type SelectOption,
} from "../../../shared/lib/styles";

type OrderStatusSelectProps = {
  value: OrderStatus | "all";
  onChange: (value: OrderStatus | "all") => void;
};

export function OrderStatusSelect({ value, onChange }: OrderStatusSelectProps) {
  const selectedOption =
    statusOptions.find((option) => option.value === value) ?? null;

  return (
    <Select<SelectOption, false>
      unstyled
      options={statusOptions}
      value={selectedOption}
      onChange={(option) => {
        if (option) {
          onChange(option.value as OrderStatus);
        }
      }}
      isClearable={false}
      isSearchable={false}
      classNames={classNamesSelect}
    />
  );
}
