import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { CategoryAsyncSelect } from "../../categories/ui/CategoryAsyncSelect";
import type { ProductsFiltersState } from "../types";
import type { SelectOption } from "../../../shared/lib/styles";

type ProductsFiltersProps = {
  filters: ProductsFiltersState;
  selectedCategory: SelectOption | null;
  onChange: <K extends keyof ProductsFiltersState>(
    key: K,
    value: ProductsFiltersState[K],
  ) => void;
  onCategoryChange: (value: SelectOption | null) => void;
  onReset: () => void;
  onRefresh: () => void;
};

export function ProductsCustomerFilters({
  filters,
  selectedCategory,
  onChange,
  onCategoryChange,
  onReset,
  onRefresh,
}: ProductsFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <Input
              label="Поиск"
              placeholder="Например: coffee"
              value={filters.search}
              onChange={(e) => onChange("search", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Мин. цена"
              inputMode="numeric"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Макс. цена"
              inputMode="numeric"
              placeholder="9999"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
            />
          </div>

          <div className="md:col-span-4">
            <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
              Наличие
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={filters.inStock === null ? "primary" : "ghost"}
                className="w-full"
                onClick={() => onChange("inStock", null)}
              >
                Все
              </Button>
              <Button
                type="button"
                variant={filters.inStock === true ? "primary" : "ghost"}
                className="w-full"
                onClick={() => onChange("inStock", true)}
              >
                В наличии
              </Button>
              <Button
                type="button"
                variant={filters.inStock === false ? "primary" : "ghost"}
                className="w-full"
                onClick={() => onChange("inStock", false)}
              >
                Нет
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
              Категория
            </div>
            <CategoryAsyncSelect
              value={selectedCategory}
              onChange={onCategoryChange}
            />
          </div>

          <div className="md:col-span-5">
            <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
              Сортировка
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={filters.sortBy === "name" ? "primary" : "ghost"}
                onClick={() => onChange("sortBy", "name")}
              >
                Название
              </Button>
              <Button
                type="button"
                variant={filters.sortBy === "price" ? "primary" : "ghost"}
                onClick={() => onChange("sortBy", "price")}
              >
                Цена
              </Button>
              <Button
                type="button"
                variant={filters.sortBy === "stock" ? "primary" : "ghost"}
                onClick={() => onChange("sortBy", "stock")}
              >
                Склад
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onChange("desc", !filters.desc)}
              >
                {filters.desc ? "По убыванию" : "По возрастанию"}
              </Button>
            </div>
          </div>

          <div className="md:col-span-2 flex items-end justify-end gap-2">
            <Button variant="ghost" type="button" onClick={onReset}>
              Сбросить
            </Button>
            <Button variant="ghost" type="button" onClick={onRefresh}>
              Обновить
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
