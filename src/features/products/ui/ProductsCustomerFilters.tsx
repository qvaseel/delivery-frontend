import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.search.trim()) count += 1;
    if (filters.minPrice.trim()) count += 1;
    if (filters.maxPrice.trim()) count += 1;
    if (filters.inStock !== null) count += 1;
    if (filters.categoryId.trim()) count += 1;
    if (filters.sortBy !== "name") count += 1;
    if (filters.desc) count += 1;

    return count;
  }, [filters]);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-custom-border bg-custom-surface-soft/70 px-4 py-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Input
            label="Поиск"
            placeholder="Например: кофе, чай, десерт"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />

          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => setExpanded((value) => !value)}
            >
              <SlidersHorizontal size={16} />
              Фильтры
              {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>

            <Button type="button" variant="ghost" onClick={onRefresh}>
              Обновить
            </Button>
          </div>

          <div className="flex items-end justify-start lg:justify-end">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={filters.inStock === null ? "primary" : "ghost"}
                onClick={() => onChange("inStock", null)}
              >
                Все
              </Button>
              <Button
                type="button"
                variant={filters.inStock === true ? "primary" : "ghost"}
                onClick={() => onChange("inStock", true)}
              >
                В наличии
              </Button>
              <Button
                type="button"
                variant={filters.inStock === false ? "primary" : "ghost"}
                onClick={() => onChange("inStock", false)}
              >
                Нет
              </Button>
            </div>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-4 px-4 py-4 md:grid-cols-12">
          <div className="md:col-span-3">
            <Input
              label="Мин. цена"
              inputMode="numeric"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Input
              label="Макс. цена"
              inputMode="numeric"
              placeholder="9999"
              value={filters.maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
              Категория
            </div>
            <CategoryAsyncSelect
              value={selectedCategory}
              onChange={onCategoryChange}
            />
          </div>

          <div className="md:col-span-3">
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
                Остаток
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

          <div className="md:col-span-12 flex justify-end">
            <Button type="button" variant="ghost" className="gap-2" onClick={onReset}>
              <RotateCcw size={16} />
              Сбросить все
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
