import Select from "react-select";
import type { PaymentMethodFilter } from "../types";
import { paymentMethodFilterOptions } from "../lib/orders.utils";
import {
  classNamesSelect,
  type SelectOption,
} from "../../../shared/lib/styles";

type PaymentMethodSelectProps = {
  value: PaymentMethodFilter;
  onChange: (value: PaymentMethodFilter) => void;
};

export function PaymentMethodSelect({
  value,
  onChange,
}: PaymentMethodSelectProps) {
  const selectedOption =
    paymentMethodFilterOptions.find((option) => option.value === value) ?? null;

  return (
    <Select<SelectOption, false>
      unstyled
      options={paymentMethodFilterOptions}
      value={selectedOption}
      onChange={(option) => {
        if (option) {
          onChange(option.value as PaymentMethodFilter);
        }
      }}
      isClearable={false}
      isSearchable={false}
      classNames={classNamesSelect}
    />
  );
}
