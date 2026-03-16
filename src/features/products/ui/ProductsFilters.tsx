import type { SelectOption } from "../../../shared/lib/styles";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { CategoryAsyncSelect } from "../../categories/ui/CategoryAsyncSelect";
import type { ProductFiltersState } from "../types";

type ProductsFiltersProps = {
  filters: ProductFiltersState;
  selectedCategory: SelectOption | null;
  onChange: <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) => void;
  onReset: () => void;
  onCategoryChange: (value: SelectOption | null) => void;
};

export function ProductsFilters({
  filters,
  onChange,
  onReset,
  onCategoryChange,
  selectedCategory,
}: ProductsFiltersProps) {
  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-6">
          <Input
            label="Поиск"
            placeholder="название/описание..."
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Мин цена"
            value={filters.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Макс цена"
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
            Наличие
          </div>

          <div className="flex gap-2">
            <Button
              variant={filters.inStock === null ? "primary" : "ghost"}
              onClick={() => onChange("inStock", null)}
            >
              Все
            </Button>

            <Button
              variant={filters.inStock === true ? "primary" : "ghost"}
              onClick={() => onChange("inStock", true)}
            >
              Да
            </Button>

            <Button
              variant={filters.inStock === false ? "primary" : "ghost"}
              onClick={() => onChange("inStock", false)}
            >
              Нет
            </Button>
          </div>
        </div>

        <div className="md:col-span-12 flex justify-end">
          <Button variant="ghost" onClick={onReset}>
            Сбросить
          </Button>
        </div>
      </div>
    </Card>
  );
}
