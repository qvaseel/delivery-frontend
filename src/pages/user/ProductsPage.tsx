import { useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { Card } from "../../shared/ui/Card";
import { Pagination } from "../../shared/ui/Pagination";
import { useProductsQuery } from "../../features/products/productsApi";
import { useDebounce } from "../../shared/lib/useDebounce";
import { useCategoriesQuery } from "../../features/categories/categoriesApi";
import type { ProductsFiltersState } from "../../features/products/types";
import {
  initialProductsFilters,
  toOptionalNumber,
} from "../../features/products/lib/products.utils";
import { ProductsCustomerFilters } from "../../features/products/ui/ProductsCustomerFilters";
import { ProductsGrid } from "../../features/products/ui/ProductsGrid";
import type { SelectOption } from "../../shared/lib/styles";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";
import { EmptyState } from "../../shared/ui/EmptyState";

export function ProductsPage() {
  const [filters, setFilters] = useState<ProductsFiltersState>(
    initialProductsFilters,
  );
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(
    null,
  );
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(filters.search, 350);
  const pageSize = 12;

  const { data: categories } = useCategoriesQuery();

  const categoryMap = useMemo(
    () =>
      new Map(
        (categories ?? []).map((category) => [category.id, category.name]),
      ),
    [categories],
  );

  const query = useMemo(() => {
    const minPrice = toOptionalNumber(filters.minPrice);
    const maxPrice = toOptionalNumber(filters.maxPrice);
    const categoryId = toOptionalNumber(filters.categoryId);

    return {
      search: debouncedSearch.trim() || undefined,
      minPrice,
      maxPrice,
      categoryId,
      inStock: filters.inStock === null ? undefined : filters.inStock,
      sortBy: filters.sortBy,
      desc: filters.desc,
      page,
      pageSize,
    };
  }, [debouncedSearch, filters, page]);

  const { data, isLoading, isError, refetch } = useProductsQuery(query);

  const handleFilterChange = <K extends keyof ProductsFiltersState>(
    key: K,
    value: ProductsFiltersState[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const handleCategoryChange = (option: SelectOption | null) => {
    setSelectedCategory(option);
    setFilters((prev) => ({
      ...prev,
      categoryId: option?.value?.toString() ?? "",
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(initialProductsFilters);
    setSelectedCategory(null);
    setPage(1);
  };

  const activeFilters = useMemo(() => {
    const items: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.search.trim()) {
      items.push({
        key: "search",
        label: `Поиск: ${filters.search.trim()}`,
        onRemove: () => handleFilterChange("search", ""),
      });
    }

    if (filters.minPrice.trim()) {
      items.push({
        key: "minPrice",
        label: `Цена от: ${filters.minPrice}`,
        onRemove: () => handleFilterChange("minPrice", ""),
      });
    }

    if (filters.maxPrice.trim()) {
      items.push({
        key: "maxPrice",
        label: `Цена до: ${filters.maxPrice}`,
        onRemove: () => handleFilterChange("maxPrice", ""),
      });
    }

    if (selectedCategory) {
      items.push({
        key: "category",
        label: `Категория: ${selectedCategory.label}`,
        onRemove: () => handleCategoryChange(null),
      });
    }

    if (filters.inStock !== null) {
      items.push({
        key: "inStock",
        label: filters.inStock ? "Только в наличии" : "Нет в наличии",
        onRemove: () => handleFilterChange("inStock", null),
      });
    }

    if (filters.sortBy !== "name" || filters.desc) {
      const sortLabel =
        filters.sortBy === "price"
          ? "Цена"
          : filters.sortBy === "stock"
            ? "Остаток"
            : "Название";

      items.push({
        key: "sort",
        label: `${sortLabel}, ${filters.desc ? "убыв." : "возр."}`,
        onRemove: () => {
          handleFilterChange("sortBy", "name");
          handleFilterChange("desc", false);
        },
      });
    }

    return items;
  }, [filters, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-custom-border bg-linear-to-br from-custom-surface to-custom-surface-soft px-5 py-6">
        <h1 className="text-2xl font-semibold text-custom-text">Товары</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-custom-text-muted">
          Быстрый поиск, аккуратные фильтры и удобное добавление в корзину без
          лишних переходов.
        </p>
      </div>

      <ProductsCustomerFilters
        filters={filters}
        selectedCategory={selectedCategory}
        onChange={handleFilterChange}
        onCategoryChange={handleCategoryChange}
        onReset={resetFilters}
        onRefresh={refetch}
      />

      {activeFilters.length > 0 ? (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  className="gap-2 border-transparent bg-custom-primary/10 px-3 py-1.5 text-custom-primary"
                >
                  {filter.label}
                  <button
                    type="button"
                    onClick={filter.onRemove}
                    className="rounded-full p-0.5 transition-colors hover:bg-custom-primary/15"
                    aria-label={`Удалить фильтр: ${filter.label}`}
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>

            <Button variant="ghost" className="gap-2" onClick={resetFilters}>
              <RotateCcw size={16} />
              Сбросить фильтры
            </Button>
          </div>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden p-0">
              <div className="h-44 animate-pulse bg-custom-surface-soft" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-custom-surface-soft" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-custom-surface-soft" />
                <div className="h-4 w-full animate-pulse rounded-full bg-custom-surface-soft" />
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {isError ? (
        <EmptyState
          title="Не удалось загрузить каталог"
          description="Проверьте соединение или повторите попытку. Фильтры и текущая страница сохранятся."
          actions={
            <Button variant="ghost" onClick={() => refetch()}>
              Повторить
            </Button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-custom-text-muted">
              Найдено{" "}
              <span className="font-semibold text-custom-text">
                {data.totalCount}
              </span>{" "}
              товаров
            </div>

            <div className="text-sm text-custom-text-muted">
              Сортировка:{" "}
              <span className="font-semibold text-custom-text">
                {filters.sortBy === "price"
                  ? "цена"
                  : filters.sortBy === "stock"
                    ? "остаток"
                    : "название"}
              </span>
            </div>
          </div>

          {data.items.length === 0 ? (
            <EmptyState
              title="По этим фильтрам ничего не найдено"
              description="Попробуйте расширить диапазон цен, снять часть ограничений или сбросить фильтры."
              actions={
                <>
                  <Button onClick={resetFilters}>Сбросить фильтры</Button>
                  <Button variant="ghost" onClick={() => refetch()}>
                    Обновить
                  </Button>
                </>
              }
            />
          ) : (
            <>
              <ProductsGrid items={data.items} categoryMap={categoryMap} />

              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalCount={data.totalCount}
                pageSize={data.pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
