import Select from "react-select";
import {
  classNamesSelect,
  type SelectOption,
} from "../../../shared/lib/styles";
import type { EmployeeRole } from "../types";

type RoleSelectProps = {
  value: EmployeeRole | "all";
  onChange: (value: EmployeeRole | "all") => void;
  isDisabled?: boolean;
  placeholder?: string;
  options: SelectOption[];
};

export function RoleSelect({
  value,
  onChange,
  isDisabled,
  placeholder = "Роль",
  options,
}: RoleSelectProps) {
  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  return (
    <Select
      value={selectedOption}
      onChange={(option) => {
        if (option) {
          onChange(option.value as EmployeeRole);
        }
      }}
      options={options}
      isDisabled={isDisabled}
      placeholder={placeholder}
      isClearable={false}
      loadingMessage={() => "Загрузка..."}
      noOptionsMessage={() => "Ничего не найдено"}
      unstyled
      classNames={classNamesSelect}
    />
  );
}
