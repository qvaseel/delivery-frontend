import type { ProductDto } from "../../features/products/types";

export type CartRow = {
  cartItem: {
    productId: number;
    quantity: number;
  };
  product: ProductDto;
};