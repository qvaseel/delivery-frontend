export type ProductDto = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
  categoryId: number;
  categoryName: string;
};

export type CreateProductDto = {
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
};

export type CreateProductScheme = {
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  categoryId: {
    label: string;
    value: number;
  };
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ProductListQuery = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  categoryId?: number;
  sortBy?: "name" | "price" | "stock";
  desc?: boolean;

  page?: number;
  pageSize?: number;
};

export type ProductFiltersState = {
  search: string;
  minPrice: string;
  maxPrice: string;
  categoryId: string;
  inStock: boolean | null;
};

export type ProductCreateDto = {
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
};

export type ProductUpdateDto = {
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
};

export type EditableProduct = ProductDto | null;

export type ProductsFiltersState = {
  search: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean | null;
  sortBy: "name" | "price" | "stock";
  desc: boolean;
  categoryId: string;
};

export type ProductCategoryMap = Map<number, string>;

export type ProductCardViewModel = {
  product: ProductDto;
  categoryName?: string;
};
