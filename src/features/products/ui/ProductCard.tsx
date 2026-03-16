import { Link } from "react-router-dom";
import type React from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { API_URL } from "../../../shared/lib/constants";
import { Card } from "../../../shared/ui/Card";
import { cartActions } from "../../cart/cartSlice";
import type { ProductDto } from "../types";
import { Badge } from "../../../shared/ui/Badge";
import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import { InlineQty } from "../../../shared/ui/InlineQty";

type Props = {
  product: ProductDto;
  categoryName?: string;
};

export function ProductCard({ product, categoryName }: Props) {
  const dispatch = useAppDispatch();

  const qtyInCart = useAppSelector(
    (state) =>
      state.cart.items.find((item) => item.productId === product.id)
        ?.quantity ?? 0,
  );

  const imgSrc = product.imageUrl ? `${API_URL}${product.imageUrl}` : null;
  const inStock = product.stockQuantity > 0;
  const incDisabled = qtyInCart >= product.stockQuantity;

  const stop = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onAdd = (event: React.MouseEvent) => {
    stop(event);
    dispatch(cartActions.add({ productId: product.id, quantity: 1 }));
  };

  const onInc = (event: React.MouseEvent) => {
    stop(event);
    if (!incDisabled) {
      dispatch(cartActions.increment(product.id));
    }
  };

  const onDec = (event: React.MouseEvent) => {
    stop(event);
    dispatch(cartActions.decrement(product.id));
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-[0_6px_24px_rgba(2,6,23,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.28)]">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-[16/10] bg-custom-surface-soft">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-custom-text-subtle">
              Нет картинки
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="line-clamp-1 text-base font-semibold text-custom-text">
                {product.name}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {categoryName ? <Badge>{categoryName}</Badge> : null}

                {inStock ? (
                  <Badge className="border-transparent bg-custom-success-soft text-custom-success">
                    В наличии
                  </Badge>
                ) : (
                  <Badge className="border-transparent bg-custom-danger-soft text-custom-danger">
                    Нет в наличии
                  </Badge>
                )}
              </div>

              {product.description ? (
                <div className="mt-2 line-clamp-2 text-sm text-custom-text-muted">
                  {product.description}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold text-custom-text">
                {formatPrice(product.price)}
              </div>
              <div className="mt-1 text-xs text-custom-text-muted">
                Склад:{" "}
                <span className="font-semibold text-custom-text">
                  {product.stockQuantity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex justify-end px-4 pb-4">
        {qtyInCart === 0 ? (
          <Button disabled={!inStock} onClick={onAdd} type="button">
            В корзину
          </Button>
        ) : (
          <InlineQty
            value={qtyInCart}
            onDec={onDec}
            onInc={onInc}
            decDisabled={qtyInCart <= 0}
            incDisabled={!inStock || incDisabled}
          />
        )}
      </div>
    </Card>
  );
}
