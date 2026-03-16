import { useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import { useProductsByIdsQuery } from "../../features/products/productsApi";
import type { ProductDto } from "../../features/products/types";
import type { CartRow } from "./types";

export function useCartDetails() {
  const cart = useAppSelector((state) => state.cart.items);

  const ids = useMemo(() => cart.map((item) => item.productId), [cart]);

  const {
    data: products,
    isLoading,
    isError,
  } = useProductsByIdsQuery(ids, {
    skip: ids.length === 0,
  });

  const productsMap = useMemo(() => {
    const map = new Map<number, ProductDto>();
    (products ?? []).forEach((product) => map.set(product.id, product));
    return map;
  }, [products]);

  const rows = useMemo<CartRow[]>(() => {
    return cart
      .map((cartItem) => {
        const product = productsMap.get(cartItem.productId);

        if (!product) {
          return null;
        }

        return {
          cartItem,
          product,
        };
      })
      .filter((row): row is CartRow => row !== null);
  }, [cart, productsMap]);

  const total = useMemo(() => {
    return rows.reduce(
      (sum, row) => sum + row.product.price * row.cartItem.quantity,
      0,
    );
  }, [rows]);

  const totalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const hasStockIssues = useMemo(() => {
    return rows.some((row) => row.cartItem.quantity > row.product.stockQuantity);
  }, [rows]);

  return {
    cart,
    rows,
    total,
    totalQuantity,
    hasStockIssues,
    isLoading,
    isError,
  };
}