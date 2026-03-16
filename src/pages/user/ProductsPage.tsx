import { useMemo, useState } from "react";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-custom-text">Товары</h1>
        <p className="mt-1 text-sm text-custom-text-muted">
          Поиск, фильтры и добавление в корзину.
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

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">Загрузка...</div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Ошибка загрузки товаров. Проверь API и CORS.
          </div>
        </Card>
      ) : null}

      {data ? (
        <>
          <div className="flex items-center justify-between">
            <div className="text-sm text-custom-text-muted">
              Найдено:{" "}
              <span className="font-semibold text-custom-text">
                {data.totalCount}
              </span>
            </div>
          </div>

          <ProductsGrid items={data.items} categoryMap={categoryMap} />

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  );
}
