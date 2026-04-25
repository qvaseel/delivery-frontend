import toast from "react-hot-toast";
import { AlertTriangle, ArrowRight, RotateCcw, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { useAppDispatch } from "../../app/hooks";
import { cartActions } from "../../features/cart/cartSlice";
import { useCreateOrderMutation } from "../../features/orders/ordersApi";
import { useCartDetails } from "../../features/cart/useCartDetails";
import { CartItemsList } from "../../features/cart/ui/CartItemsList";
import { CheckoutCard } from "../../features/cart/ui/CheckoutCard";
import { EmptyState } from "../../shared/ui/EmptyState";

const DADATA_TOKEN = "c495416bba6542f7540a2a0bf6d09ec82b81bc0a";

export function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    cart,
    rows,
    total,
    totalQuantity,
    hasStockIssues,
    isLoading,
    isError,
  } = useCartDetails();

  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const disabledReason =
    rows.length === 0
      ? "Добавьте товары, чтобы перейти к оформлению."
      : hasStockIssues
        ? "В корзине есть позиции с количеством выше доступного остатка."
        : null;

  const handleCreateOrder = async ({ address }: { address: string }) => {
    if (rows.length === 0) {
      toast.error("Корзина пустая");
      return;
    }

    for (const row of rows) {
      if (row.cartItem.quantity > row.product.stockQuantity) {
        toast.error(`Недостаточно на складе: ${row.product.name}`);
        return;
      }
    }

    try {
      const order = await createOrder({
        address,
        items: rows.map((row) => ({
          productId: row.product.id,
          quantity: row.cartItem.quantity,
        })),
      }).unwrap();

      dispatch(cartActions.clear());
      toast.success(`Заказ #${order.id} создан`);
      navigate("/orders");
    } catch {
      toast.error("Не удалось оформить заказ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-custom-border bg-linear-to-br from-custom-surface to-custom-surface-soft px-5 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-custom-text">Корзина</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-custom-text-muted">
              Проверьте состав заказа, скорректируйте количество и завершите
              оформление без лишних шагов.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => dispatch(cartActions.clear())}
              disabled={cart.length === 0}
            >
              Очистить
            </Button>

            <Button variant="ghost" onClick={() => navigate("/products")}>
              Продолжить покупки
            </Button>
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        <EmptyState
          title="Корзина пока пустая"
          description="Добавьте товары из каталога, чтобы быстро вернуться к оформлению заказа."
          actions={
            <Button className="gap-2" onClick={() => navigate("/products")}>
              <ShoppingBag size={16} />
              Перейти к товарам
            </Button>
          }
        />
      ) : null}

      {cart.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <div className="text-sm text-custom-text-muted">Позиций в корзине</div>
              <div className="mt-1 text-2xl font-semibold text-custom-text">
                {rows.length}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-custom-text-muted">Количество товаров</div>
              <div className="mt-1 text-2xl font-semibold text-custom-text">
                {totalQuantity}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-custom-text-muted">Готовность к заказу</div>
              <div className="mt-1 text-sm font-semibold text-custom-text">
                {hasStockIssues ? "Нужно исправить остатки" : "Можно оформлять"}
              </div>
            </Card>
          </div>

          {hasStockIssues ? (
            <Card className="border-custom-warning/20 bg-custom-warning-soft p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-custom-warning"
                  />
                  <div>
                    <div className="font-semibold text-custom-text">
                      Некоторые позиции требуют внимания
                    </div>
                    <div className="mt-1 text-sm text-custom-text-muted">
                      Уменьшите количество товаров, где остаток на складе уже меньше,
                      чем в корзине.
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => navigate("/products")}
                >
                  Обновить выбор
                  <ArrowRight size={16} />
                </Button>
              </div>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-custom-text-muted">
                  Проверьте состав корзины перед оформлением.
                </div>
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => navigate("/products")}
                >
                  <RotateCcw size={16} />
                  Изменить выбор
                </Button>
              </div>

              <CartItemsList
                rows={rows}
                isLoading={isLoading}
                isError={isError}
                onIncrement={(productId) => dispatch(cartActions.increment(productId))}
                onDecrement={(productId) => dispatch(cartActions.decrement(productId))}
                onRemove={(productId) => dispatch(cartActions.remove(productId))}
              />
            </div>

            <CheckoutCard
              total={total}
              totalQuantity={totalQuantity}
              disabled={isCreating || rows.length === 0 || hasStockIssues}
              disabledReason={disabledReason}
              isSubmitting={isCreating}
              onSubmit={handleCreateOrder}
              dadataToken={DADATA_TOKEN}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
