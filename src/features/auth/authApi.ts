import { baseApi } from "../../app/baseApi";
import type { AuthResultDto, LoginDto, RegisterDto, MeDto } from "./types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResultDto, RegisterDto>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: builder.mutation<AuthResultDto, LoginDto>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    me: builder.query<MeDto, void>({
      query: () => ({ url: "/me" }),
      providesTags: ["Me"],
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useMeQuery } = authApi;
