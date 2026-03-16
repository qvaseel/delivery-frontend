import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { useAppDispatch } from "../../app/hooks";
import { cartActions } from "../../features/cart/cartSlice";
import { useCreateOrderMutation } from "../../features/orders/ordersApi";
import { useCartDetails } from "../../features/cart/useCartDetails";
import { CartItemsList } from "../../features/cart/ui/CartItemsList";
import { CheckoutCard } from "../../features/cart/ui/CheckoutCard";

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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-custom-text">Корзина</h1>
          <p className="mt-1 text-sm text-custom-text-muted">
            Управляй количеством, проверь итог и оформи заказ.
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
            К товарам
          </Button>
        </div>
      </div>

      {cart.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm text-custom-text-muted">Корзина пустая.</div>
        </Card>
      ) : null}

      {cart.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <CartItemsList
              rows={rows}
              isLoading={isLoading}
              isError={isError}
              onIncrement={(productId) =>
                dispatch(cartActions.increment(productId))
              }
              onDecrement={(productId) =>
                dispatch(cartActions.decrement(productId))
              }
              onRemove={(productId) => dispatch(cartActions.remove(productId))}
            />
          </div>

          <CheckoutCard
            total={total}
            totalQuantity={totalQuantity}
            disabled={isCreating || rows.length === 0 || hasStockIssues}
            onSubmit={handleCreateOrder}
            dadataToken={DADATA_TOKEN}
          />
        </div>
      ) : null}
    </div>
  );
}
