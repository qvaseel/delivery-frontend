import { baseApi } from "../../app/baseApi";
import type {
  PagedResult,
  ProductCreateDto,
  ProductDto,
  ProductListQuery,
  ProductUpdateDto,
} from "./types";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    products: builder.query<PagedResult<ProductDto>, ProductListQuery>({
      query: (q) => ({
        url: "/products",
        params: {
          search: q.search ?? undefined,
          minPrice: q.minPrice ?? undefined,
          maxPrice: q.maxPrice ?? undefined,
          categoryId: q.categoryId ?? undefined,
          inStock: typeof q.inStock === "boolean" ? q.inStock : undefined,
          sortBy: q.sortBy ?? undefined,
          desc: typeof q.desc === "boolean" ? q.desc : undefined,
          page: q.page ?? 1,
          pageSize: q.pageSize ?? 12,
        },
      }),
      providesTags: ["Products"],
    }),

    productById: builder.query<ProductDto, number>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: ["Products"],
    }),

    productsByIds: builder.query<ProductDto[], number[]>({
      async queryFn(ids, _api, _extraOptions, baseQuery) {
        const unique = Array.from(new Set(ids)).filter((x) => x > 0);
        if (unique.length === 0) return { data: [] };

        const results = await Promise.all(
          unique.map((id) => baseQuery({ url: `/products/${id}` })),
        );

        const errors = results.filter((r: any) => r.error);
        if (errors.length) {
          return { error: errors[0].error as any };
        }

        const data = results.map((r: any) => r.data as ProductDto);
        return { data };
      },
      providesTags: ["Products"],
    }),

    createProduct: builder.mutation<void, ProductCreateDto>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<void, { id: number; body: ProductUpdateDto }>({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),

    uploadProductImage: builder.mutation<
      ProductDto,
      { id: number; file: File }
    >({
      query: ({ id, file }) => {
        const form = new FormData();
        form.append("file", file);
        return {
          url: `/products/${id}/image`,
          method: "POST",
          body: form,
        };
      },
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useProductsQuery,
  useProductByIdQuery,
  useProductsByIdsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} = productsApi;
