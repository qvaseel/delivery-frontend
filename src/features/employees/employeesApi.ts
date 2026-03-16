import { baseApi } from "../../app/baseApi";
import type {
  CreateEmployeeDto,
  EmployeeDto,
  EmployeeListQuery,
  PagedResult,
} from "./types";

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    employees: builder.query<PagedResult<EmployeeDto>, EmployeeListQuery>({
      query: (q) => ({
        url: "/employees",
        params: {
          search: q.search ?? undefined,
          role: q.role ?? undefined,
          page: q.page ?? 1,
          pageSize: q.pageSize ?? 50,
        },
      }),
      providesTags: ["Employees"],
    }),
    createEmployee: builder.mutation<EmployeeDto, CreateEmployeeDto>({
      query: (body) => ({ url: "/employees", method: "POST", body }),
      invalidatesTags: ["Employees"],
    }),
  }),
});

export const { useEmployeesQuery, useCreateEmployeeMutation, useLazyEmployeesQuery } = employeesApi;
