import type { SelectOption } from "../../../shared/lib/styles";
import { EmployeeAsyncSelect } from "./EmployeeAsyncSelect";

type CourierAsyncSelectProps = {
  value: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
  isDisabled?: boolean;
};

export function CourierAsyncSelect({
  value,
  onChange,
  isDisabled,
}: CourierAsyncSelectProps) {
  return (
    <EmployeeAsyncSelect
      value={value}
      onChange={onChange}
      isDisabled={isDisabled}
      placeholder="Назначить курьера..."
      role={1}
    />
  );
}
