import { baseApi } from "../../app/baseApi";
import type { CustomerListRequest, CustomerListResponse } from "./types";

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    customers: builder.query<CustomerListResponse, CustomerListRequest>({
      query: (params) => ({ url: "/customers", params }),
      providesTags: ["Customers"],
    }),
  }),
});

export const { useCustomersQuery, useLazyCustomersQuery } = customersApi;
