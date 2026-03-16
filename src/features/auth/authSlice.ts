import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MeDto } from "./types";

type AuthState = {
  accessToken: string | null;
  me: MeDto | null;
  meLoaded: boolean;
};

const initialState: AuthState = {
  accessToken: localStorage.getItem("accessToken"),
  me: null,
  meLoaded: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      state.me = null;
      state.meLoaded = false;
      localStorage.setItem("accessToken", action.payload);
    },
    setMe(state, action: PayloadAction<MeDto | null>) {
      state.me = action.payload;
      state.meLoaded = true;
    },
    logout(state) {
      state.accessToken = null;
      state.me = null;
      state.meLoaded = false;
      localStorage.removeItem("accessToken");
    },
  },
});

export const authReducer = slice.reducer;
export const authActions = slice.actions;
