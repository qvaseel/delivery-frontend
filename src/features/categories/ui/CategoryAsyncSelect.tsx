import { AsyncPaginate } from "react-select-async-paginate";
import type { GroupBase } from "react-select";
import {
  classNamesSelect,
  type SelectOption,
} from "../../../shared/lib/styles";
import { useLazyCategoriesQuery } from "../categoriesApi";

type CategoryAsyncSelectProps = {
  value: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
  isDisabled?: boolean;
  placeholder?: string;
};

type Additional = {
  page: number;
};

export function CategoryAsyncSelect({
  value,
  onChange,
  isDisabled,
  placeholder = "Категория",
}: CategoryAsyncSelectProps) {
  const [trigger] = useLazyCategoriesQuery();

  const loadOptions = async (
    search: string,
    loadedOptions: SelectOption[],
    additional?: Additional,
  ) => {
    const page = additional?.page ?? 1;

    const response = await trigger().unwrap();

    const allOptions: SelectOption[] = response.map((category) => ({
      value: String(category.id),
      label: category.name,
    }));

    const filtered = search.trim()
      ? allOptions.filter((option) =>
          option.label.toLowerCase().includes(search.trim().toLowerCase()),
        )
      : allOptions;

    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filtered.slice(start, end);

    return {
      options: pageItems,
      hasMore: end < filtered.length,
      additional: {
        page: page + 1,
      },
    };
  };

  return (
    <AsyncPaginate<SelectOption, GroupBase<SelectOption>, Additional>
      unstyled
      value={value}
      loadOptions={loadOptions}
      onChange={onChange}
      additional={{ page: 1 }}
      debounceTimeout={300}
      isClearable
      isDisabled={isDisabled}
      placeholder={placeholder}
      noOptionsMessage={() => "Ничего не найдено"}
      loadingMessage={() => "Загрузка..."}
      classNames={classNamesSelect}
    />
  );
}
