import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Pagination } from "../../shared/ui/Pagination";
import { useDebounce } from "../../shared/lib/useDebounce";
import type {
  CreateProductDto,
  ProductDto,
  ProductFiltersState,
} from "../../features/products/types";
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} from "../../features/products/productsApi";
import { useCategoriesQuery } from "../../features/categories/categoriesApi";
import { toOptionalNumber } from "../../features/products/lib/products.utils";
import { ProductsFilters } from "../../features/products/ui/ProductsFilters";
import { ProductsTable } from "../../features/products/ui/ProductsTable";
import { CreateProductModal } from "../../features/products/ui/CreateProductModal";
import { EditProductModal } from "../../features/products/ui/EditProductModal";
import type { SelectOption } from "../../shared/lib/styles";

const initialFilters: ProductFiltersState = {
  search: "",
  minPrice: "",
  maxPrice: "",
  categoryId: "",
  inStock: null,
};

export function AdminProductsPage() {
  const [filters, setFilters] = useState<ProductFiltersState>(initialFilters);
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(
    null,
  );

  const debouncedSearch = useDebounce(filters.search, 350);
  const pageSize = 10;

  const query = useMemo(() => {
    const minPrice = toOptionalNumber(filters.minPrice);
    const maxPrice = toOptionalNumber(filters.maxPrice);
    const categoryId = toOptionalNumber(filters.categoryId);

    return {
      search: debouncedSearch.trim() || undefined,
      minPrice,
      maxPrice,
      inStock: filters.inStock === null ? undefined : filters.inStock,
      categoryId,
      page,
      pageSize,
      sortBy: "name" as const,
      desc: false,
    };
  }, [debouncedSearch, filters, page]);

  const { data, isLoading, isError, refetch } = useProductsQuery(query);
  const { data: categories } = useCategoriesQuery();

  const categoryMap = useMemo(
    () =>
      new Map(
        (categories ?? []).map((category) => [category.id, category.name]),
      ),
    [categories],
  );

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [uploadImage, { isLoading: uploading }] =
    useUploadProductImageMutation();

  const handleFilterChange = <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
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

  const handleCreateProduct = async (formData: CreateProductDto) => {
    try {
      await createProduct(formData).unwrap();
      toast.success("Товар создан");
      setIsCreateOpen(false);
    } catch {
      toast.error("Не удалось создать товар (проверь роль Manager/Admin)");
      throw new Error("Create product failed");
    }
  };

  const handleUpdateProduct = async (
    id: number,
    formData: CreateProductDto,
  ) => {
    try {
      await updateProduct({ id, body: formData }).unwrap();
      toast.success("Товар обновлён");
      setEditingProduct(null);
    } catch {
      toast.error("Не удалось обновить товар");
      throw new Error("Update product failed");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Удалить товар?")) return;

    try {
      await deleteProduct(id).unwrap();
      toast.success("Товар удалён");
    } catch {
      toast.error("Не удалось удалить товар");
    }
  };

  const handleUploadImage = async (id: number, file: File) => {
    try {
      const updatedProduct = await uploadImage({ id, file }).unwrap();
      setEditingProduct(updatedProduct);
      toast.success("Картинка обновлена");
    } catch {
      toast.error("Не удалось загрузить картинку");
      throw new Error("Upload image failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">
            Товары (админ)
          </h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Создание, редактирование, удаление и загрузка изображения.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => refetch()}>
            Обновить
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>Создать товар</Button>
        </div>
      </div>

      <ProductsFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={resetFilters}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">Загрузка...</div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Ошибка загрузки
          </div>
        </Card>
      ) : null}

      {data ? (
        <>
          <ProductsTable
            items={data.items}
            categoryMap={categoryMap}
            deleting={deleting}
            onEdit={setEditingProduct}
            onDelete={handleDeleteProduct}
          />

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}

      <CreateProductModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateProduct}
        loading={creating}
      />

      <EditProductModal
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSubmit={handleUpdateProduct}
        onUploadImage={handleUploadImage}
        saving={updating}
        uploading={uploading}
      />
    </div>
  );
}
