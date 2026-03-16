import { baseApi } from "../../app/baseApi";
import type { CategoryDto } from "./types";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    categories: builder.query<CategoryDto[], void>({
      query: () => ({ url: "/categories" }),
      providesTags: ["Categories"],
    }),

    createCategory: builder.mutation<CategoryDto, { name: string }>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<CategoryDto, { id: number; name: string }>({
      query: ({ id, name }) => ({ url: `/categories/${id}`, method: "PUT", body: { name } }),
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useCategoriesQuery,
  useLazyCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;