import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useMemo } from "react";
import { API_URL } from "../../shared/lib/constants";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";
import { formatPrice } from "../../shared/lib/format";
import { useProductByIdQuery } from "../../features/products/productsApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { cartActions } from "../../features/cart/cartSlice";
import { InlineQty } from "../../shared/ui/InlineQty";

export function ProductDetailsPage() {
  const { id } = useParams();
  const productId = Number(id);

  const dispatch = useAppDispatch();
  const qtyInCart = useAppSelector(
    (s) => s.cart.items.find((x) => x.productId === productId)?.quantity ?? 0,
  );

  const {
    data: p,
    isLoading,
    isError,
  } = useProductByIdQuery(productId, {
    skip: !Number.isFinite(productId) || productId <= 0,
  });

  const imgSrc = p?.imageUrl ? `${API_URL}${p.imageUrl}` : null;
  const inStock = (p?.stockQuantity ?? 0) > 0;

  const canInc = useMemo(() => {
    if (!p) return false;
    return qtyInCart < p.stockQuantity;
  }, [p, qtyInCart]);

  if (!Number.isFinite(productId) || productId <= 0) {
    return (
      <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
        <div className="text-sm font-medium text-custom-danger">
          Неверный id товара.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-sm text-custom-text-muted">
        <Link
          to="/products"
          className="font-medium text-custom-primary transition-colors hover:text-custom-primary-hover hover:underline"
        >
          Товары
        </Link>{" "}
        / <span className="text-custom-text">Детали</span>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">Загрузка...</div>
        </Card>
      ) : null}

      {isError ? (
        <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
          <div className="text-sm font-medium text-custom-danger">
            Товар не найден.
          </div>
        </Card>
      ) : null}

      {p ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="aspect-[16/11] bg-custom-surface-soft">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-custom-text-subtle">
                  Нет изображения
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-custom-text">
                  {p.name}
                </h1>
                <div className="mt-2 text-sm text-custom-text-muted">
                  {p.description || "Описание отсутствует."}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold text-custom-text">
                  {formatPrice(p.price)}
                </div>
                <div className="mt-2">
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
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-custom-border bg-custom-surface-soft p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-custom-text-muted">На складе</span>
                <span className="font-semibold text-custom-text">
                  {p.stockQuantity}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-custom-text-muted">В корзине</span>
                <span className="font-semibold text-custom-text">
                  {qtyInCart}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <InlineQty
                value={qtyInCart}
                onDec={() => dispatch(cartActions.decrement(p.id))}
                onInc={() => dispatch(cartActions.increment(p.id))}
                decDisabled={qtyInCart <= 0}
                incDisabled={!canInc}
              />

              <div className="flex gap-2">
                <Button
                  disabled={!inStock || !canInc}
                  onClick={() => {
                    dispatch(cartActions.add({ productId: p.id, quantity: 1 }));
                    toast.success("Добавлено в корзину");
                  }}
                >
                  В корзину
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => dispatch(cartActions.remove(p.id))}
                >
                  Удалить
                </Button>
              </div>
            </div>

            <div className="mt-4 text-xs leading-5 text-custom-text-subtle">
              Подсказка: количество нельзя увеличить выше остатка на складе.
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
