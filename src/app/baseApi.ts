import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../shared/lib/constants";
import type { RootState } from "./store";
import toast from "react-hot-toast";
import { authActions } from "../features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

let authToastShown = false;

const baseQueryWithAuthHandling: typeof rawBaseQuery = async (
  args,
  api,
  extraOptions,
) => {
  const result: any = await rawBaseQuery(args, api, extraOptions);
  const status = result?.error?.status;

  if (status === 401) {
    if (!authToastShown) {
      authToastShown = true;
      toast.error("Сессия истекла. Войдите снова.");
      setTimeout(() => (authToastShown = false), 1500);
    }

    api.dispatch(authActions.logout());

    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }

  if (status === 403) {
    toast.error("Недостаточно прав для этого действия.");
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: [
    "Me",
    "Products",
    "Orders",
    "Employees",
    "Categories",
    "Customers",
    "Notifications",
  ],
  endpoints: () => ({}),
});
