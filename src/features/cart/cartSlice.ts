import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CartItem = { productId: number; quantity: number };
type CartState = { items: CartItem[] };

const load = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
};

const save = (items: CartItem[]) => localStorage.setItem("cart", JSON.stringify(items));

const initialState: CartState = { items: load() };

const slice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    add(state, action: PayloadAction<{ productId: number; quantity?: number }>) {
      const qty = action.payload.quantity ?? 1;
      const found = state.items.find((x) => x.productId === action.payload.productId);
      if (found) found.quantity += qty;
      else state.items.push({ productId: action.payload.productId, quantity: qty });
      save(state.items);
    },
    remove(state, action: PayloadAction<number>) {
      state.items = state.items.filter((x) => x.productId !== action.payload);
      save(state.items);
    },
    setQuantity(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((x) => x.productId !== productId);
      } else {
        const found = state.items.find((x) => x.productId === productId);
        if (found) found.quantity = quantity;
        else state.items.push({ productId, quantity });
      }
      save(state.items);
    },
    increment(state, action: PayloadAction<number>) {
      const found = state.items.find((x) => x.productId === action.payload);
      if (found) found.quantity += 1;
      else state.items.push({ productId: action.payload, quantity: 1 });
      save(state.items);
    },
    decrement(state, action: PayloadAction<number>) {
      const found = state.items.find((x) => x.productId === action.payload);
      if (!found) return;
      found.quantity -= 1;
      if (found.quantity <= 0) {
        state.items = state.items.filter((x) => x.productId !== action.payload);
      }
      save(state.items);
    },
    clear(state) {
      state.items = [];
      save(state.items);
    },
  },
});

export const cartReducer = slice.reducer;
export const cartActions = slice.actions;