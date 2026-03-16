import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut } from "lucide-react";
import { ThemeToggle } from "../features/theme/ThemeToggle";
import { Button } from "../shared/ui/Button";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { authActions } from "../features/auth/authSlice";
import { baseApi } from "../app/baseApi";

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const count = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const token = useAppSelector((s) => s.auth.accessToken);
  const me = useAppSelector((s) => s.auth.me);
  const meLoaded = useAppSelector((s) => s.auth.meLoaded);

  const roles = me?.roles ?? [];
  const isCustomer = roles.includes("Customer");
  const isCourier = roles.includes("Courier");
  const isManager = roles.includes("Manager");
  const isAdmin = roles.includes("Admin");

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "font-semibold text-custom-text"
      : "text-custom-text-muted transition-colors hover:text-custom-text";

  return (
    <div className="sticky top-0 z-40 border-b border-custom-border bg-custom-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-custom-text transition-opacity hover:opacity-90"
        >
          Delivery
        </Link>

        {token && meLoaded ? (
          <nav className="hidden gap-6 md:flex">
            {isCustomer ? (
              <>
                <NavLink to="/products" className={linkClass}>
                  Товары
                </NavLink>
                <NavLink to="/orders" className={linkClass}>
                  Заказы
                </NavLink>
              </>
            ) : null}

            {isCourier ? (
              <NavLink to="/courier/orders" className={linkClass}>
                Курьер
              </NavLink>
            ) : null}

            {isManager || isAdmin ? (
              <>
                <NavLink to="/admin/orders" className={linkClass}>
                  Управление
                </NavLink>
                <NavLink to="/admin/products" className={linkClass}>
                  Товары (админ)
                </NavLink>
                <NavLink to="/admin/categories" className={linkClass}>
                  Категории
                </NavLink>
              </>
            ) : null}

            {isAdmin ? (
              <NavLink to="/admin/employees" className={linkClass}>
                Сотрудники
              </NavLink>
            ) : null}

            {isCustomer ? (
              <NavLink to="/cart" className={linkClass}>
                Корзина
              </NavLink>
            ) : null}
          </nav>
        ) : token ? (
          <div className="hidden md:block text-sm text-custom-text-muted">
            Загрузка...
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {token ? (
            <>
              {isCustomer ? (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/cart")}
                  className="relative px-3"
                >
                  <ShoppingCart size={18} />
                  {count > 0 ? (
                    <span className="absolute -right-1 -top-1 rounded-full bg-custom-primary px-2 py-0.5 text-xs font-semibold text-custom-primary-foreground shadow-sm">
                      {count}
                    </span>
                  ) : null}
                </Button>
              ) : null}

              <Button
                variant="ghost"
                onClick={() => {
                  dispatch(authActions.logout());
                  dispatch(baseApi.util.resetApiState());
                  navigate("/login");
                }}
                className="px-3"
                title="Выйти"
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Вход
              </Button>
              <Button onClick={() => navigate("/register")}>Регистрация</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
