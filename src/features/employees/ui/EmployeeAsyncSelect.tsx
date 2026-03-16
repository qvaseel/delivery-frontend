import { AsyncPaginate } from "react-select-async-paginate";
import type { GroupBase } from "react-select";
import { useLazyEmployeesQuery } from "../employeesApi";
import type { EmployeeRole } from "../types";
import {
  classNamesSelect,
  type SelectOption,
} from "../../../shared/lib/styles";

type LoadEmployeesAdditional = {
  page: number;
};

type EmployeeAsyncSelectProps = {
  value: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
  isDisabled?: boolean;
  placeholder?: string;
  role?: EmployeeRole;
};

const mapEmployeeToOption = (employee: {
  id: number;
  fullName: string;
  role: EmployeeRole;
}): SelectOption => ({
  value: String(employee.id),
  label: `#${employee.id} • ${employee.fullName}`,
  employee,
});

export function EmployeeAsyncSelect({
  value,
  onChange,
  isDisabled,
  placeholder = "Найти сотрудника...",
  role,
}: EmployeeAsyncSelectProps) {
  const [trigger] = useLazyEmployeesQuery();

  const loadOptions = async (
    search: string,
    _loadedOptions: SelectOption[],
    additional?: LoadEmployeesAdditional,
  ) => {
    const page = additional?.page ?? 1;

    const response = await trigger({
      search: search.trim() || undefined,
      role,
      page,
      pageSize: 20,
    }).unwrap();

    return {
      options: response.items.map(mapEmployeeToOption),
      hasMore: page < response.totalPages,
      additional: {
        page: page + 1,
      },
    };
  };

  return (
    <AsyncPaginate<
      SelectOption,
      GroupBase<SelectOption>,
      LoadEmployeesAdditional
    >
      unstyled
      value={value}
      loadOptions={loadOptions}
      onChange={onChange}
      additional={{ page: 1 }}
      debounceTimeout={350}
      isClearable
      isDisabled={isDisabled}
      placeholder={placeholder}
      noOptionsMessage={() => "Ничего не найдено"}
      loadingMessage={() => "Загрузка..."}
      classNames={classNamesSelect}
    />
  );
}
