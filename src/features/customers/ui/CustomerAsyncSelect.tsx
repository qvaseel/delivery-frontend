import { AsyncPaginate } from "react-select-async-paginate";
import type { GroupBase } from "react-select";
import type { CustomerDto } from "../types";
import { useLazyCustomersQuery } from "../customersApi";
import {
  classNamesSelect,
  type SelectOption,
} from "../../../shared/lib/styles";

type LoadCustomersAdditional = {
  page: number;
};

type CustomerAsyncSelectProps = {
  value: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
};

const mapCustomerToOption = (customer: CustomerDto): SelectOption => ({
  value: String(customer.id),
  label: `${customer.fullName}`,
  customer,
});

export function CustomerAsyncSelect({
  value,
  onChange,
}: CustomerAsyncSelectProps) {
  const [trigger] = useLazyCustomersQuery();

  const loadOptions = async (
    search: string,
    _loadedOptions: SelectOption[],
    additional?: LoadCustomersAdditional,
  ) => {
    const page = additional?.page ?? 1;

    const response = await trigger({
      q: search.trim() || undefined,
      page,
      pageSize: 20,
    }).unwrap();

    return {
      options: response.items.map(mapCustomerToOption),
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
      LoadCustomersAdditional
    >
      unstyled
      value={value}
      loadOptions={loadOptions}
      onChange={onChange}
      additional={{ page: 1 }}
      debounceTimeout={350}
      placeholder="Найти клиента по имени или телефону..."
      isClearable
      noOptionsMessage={() => "Ничего не найдено"}
      loadingMessage={() => "Загрузка..."}
      classNames={classNamesSelect}
    />
  );
}
