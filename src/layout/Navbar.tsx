import { useEffect, useMemo, useState } from "react";
import {
  LifeBuoy,
  LogOut,
  Menu,
  MessagesSquare,
  ShoppingCart,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { baseApi } from "../app/baseApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useHelpdeskUnreadCountQuery } from "../features/helpdesk/helpdeskApi";
import { useHelpdeskUnreadRealtime } from "../features/helpdesk/lib/useHelpdeskUnreadRealtime";
import { useOrderChatUnreadCountQuery } from "../features/orders/ordersApi";
import { useOrderChatUnreadRealtime } from "../features/orders/lib/useOrderChatUnreadRealtime";
import { NotificationsBell } from "../features/notifications/ui/NotificationsBell";
import { ThemeToggle } from "../features/theme/ThemeToggle";
import { authActions } from "../features/auth/authSlice";
import { cn } from "../shared/lib/cn";
import { Button } from "../shared/ui/Button";

type NavItem = {
  to: string;
  label: string;
};

const POLLING_INTERVAL_MS = 5000;

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = useAppSelector((s) =>
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
  const canUseHelpdesk = isCustomer || isManager || isAdmin;
  const canUseOrderChat = isCustomer || isCourier;

  const navItems = useMemo<NavItem[]>(() => {
    if (isCustomer) {
      return [
        { to: "/products", label: "Товары" },
        { to: "/orders", label: "Заказы" },
        { to: "/helpdesk", label: "Поддержка" },
        { to: "/cart", label: "Корзина" },
      ];
    }

    if (isCourier) {
      return [{ to: "/courier/orders", label: "Мои доставки" }];
    }

    const adminItems: NavItem[] = [
      { to: "/admin/orders", label: "Заказы" },
      { to: "/admin/helpdesk", label: "Поддержка" },
      { to: "/admin/products", label: "Товары" },
      { to: "/admin/categories", label: "Категории" },
    ];

    if (isAdmin) {
      adminItems.push({ to: "/admin/employees", label: "Сотрудники" });
    }

    return adminItems;
  }, [isAdmin, isCourier, isCustomer]);

  const { data: helpdeskUnread = { unreadTickets: 0, unreadMessages: 0 } } =
    useHelpdeskUnreadCountQuery(undefined, {
      skip: !token || !canUseHelpdesk,
      pollingInterval: POLLING_INTERVAL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });
  const { data: orderChatUnread = { unreadOrders: 0, unreadMessages: 0 } } =
    useOrderChatUnreadCountQuery(undefined, {
      skip: !token || !canUseOrderChat,
      pollingInterval: POLLING_INTERVAL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  useHelpdeskUnreadRealtime({
    enabled: Boolean(token && canUseHelpdesk),
  });
  useOrderChatUnreadRealtime({
    enabled: Boolean(token && canUseOrderChat),
  });

  const helpdeskBadgeLabel =
    helpdeskUnread.unreadTickets > 99
      ? "99+"
      : String(helpdeskUnread.unreadTickets);
  const orderChatBadgeLabel =
    orderChatUnread.unreadOrders > 99
      ? "99+"
      : String(orderChatUnread.unreadOrders);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "font-semibold text-custom-text"
      : "text-custom-text-muted transition-colors hover:text-custom-text";

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    dispatch(authActions.logout());
    dispatch(baseApi.util.resetApiState());
    navigate("/login");
  };

  const supportPath = isCustomer ? "/helpdesk" : "/admin/helpdesk";
  const orderChatPath = isCustomer ? "/orders" : "/courier/orders";

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-custom-border bg-custom-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            {token && meLoaded ? (
              <Button
                variant="ghost"
                onClick={() => setMobileOpen(true)}
                className="px-3 md:hidden"
                aria-label="Открыть меню"
              >
                <Menu size={18} />
              </Button>
            ) : null}

            <Link
              to="/"
              className="text-lg font-bold tracking-tight text-custom-text transition-opacity hover:opacity-90"
            >
              Delivery
            </Link>
          </div>

          {token && meLoaded ? (
            <nav className="hidden gap-6 md:flex">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : token ? (
            <div className="hidden text-sm text-custom-text-muted md:block">
              Загрузка профиля...
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {token ? (
              <>
                {isCustomer ? <NotificationsBell /> : null}

                {canUseOrderChat ? (
                  <Button
                    variant="ghost"
                    onClick={() => navigate(orderChatPath)}
                    className="relative px-3"
                    title="Чаты заказов"
                  >
                    <MessagesSquare size={18} />
                    {orderChatUnread.unreadOrders > 0 ? (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-custom-primary px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-custom-primary-foreground shadow-sm">
                        {orderChatBadgeLabel}
                      </span>
                    ) : null}
                  </Button>
                ) : null}

                {isCustomer ? (
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/cart")}
                    className="relative px-3"
                    title="Корзина"
                  >
                    <ShoppingCart size={18} />
                    {cartCount > 0 ? (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-custom-primary px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-custom-primary-foreground shadow-sm">
                        {cartCount}
                      </span>
                    ) : null}
                  </Button>
                ) : null}

                {canUseHelpdesk ? (
                  <Button
                    variant="ghost"
                    onClick={() => navigate(supportPath)}
                    className="relative px-3"
                    title="Поддержка"
                  >
                    <LifeBuoy size={18} />
                    {helpdeskUnread.unreadTickets > 0 ? (
                      <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-custom-primary px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-custom-primary-foreground shadow-sm">
                        {helpdeskBadgeLabel}
                      </span>
                    ) : null}
                  </Button>
                ) : null}

                <Button
                  variant="ghost"
                  onClick={handleLogout}
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
                <Button onClick={() => navigate("/register")}>
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-custom-overlay/55 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
          />

          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col border-r border-custom-border bg-custom-surface-elevated px-4 py-4 shadow-[0_20px_60px_rgba(2,6,23,0.24)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-custom-text">
                  Навигация
                </div>
                <div className="mt-1 text-xs text-custom-text-muted">
                  {me?.email ?? "Аккаунт"}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setMobileOpen(false)}
                className="px-3"
                aria-label="Закрыть меню"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="mt-5 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                const isCartItem = item.to === "/cart";
                const isHelpdeskItem =
                  item.to === "/helpdesk" || item.to === "/admin/helpdesk";
                const isOrderItem =
                  item.to === "/orders" || item.to === "/courier/orders";

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors",
                      isActive
                        ? "border-custom-primary/25 bg-custom-primary/10 font-semibold text-custom-text"
                        : "border-custom-border bg-custom-surface text-custom-text-muted hover:bg-custom-surface-soft hover:text-custom-text",
                    )}
                  >
                    <span>{item.label}</span>
                    {isCartItem && cartCount > 0 ? (
                      <span className="rounded-full bg-custom-primary px-2 py-0.5 text-xs font-semibold text-custom-primary-foreground">
                        {cartCount}
                      </span>
                    ) : null}
                    {isHelpdeskItem && helpdeskUnread.unreadTickets > 0 ? (
                      <span className="rounded-full bg-custom-primary px-2 py-0.5 text-xs font-semibold text-custom-primary-foreground">
                        {helpdeskBadgeLabel}
                      </span>
                    ) : null}
                    {isOrderItem && orderChatUnread.unreadOrders > 0 ? (
                      <span className="rounded-full bg-custom-primary px-2 py-0.5 text-xs font-semibold text-custom-primary-foreground">
                        {orderChatBadgeLabel}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-custom-border bg-custom-surface-soft px-4 py-4">
              <div className="text-sm font-semibold text-custom-text">
                Быстрые действия
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {isCustomer ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/cart");
                    }}
                  >
                    Корзина
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
