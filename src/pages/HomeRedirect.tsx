import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export function HomeRedirect() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const me = useAppSelector((s) => s.auth.me);
  const meLoaded = useAppSelector((s) => s.auth.meLoaded);

  if (!token) return <Navigate to="/login" replace />;
  if (!meLoaded || !me)
    return <div className="text-sm text-custom-text-muted">Загрузка...</div>;

  const roles = me.roles;
  if (roles.includes("Customer")) return <Navigate to="/products" replace />;
  if (roles.includes("Courier"))
    return <Navigate to="/courier/orders" replace />;
  if (roles.includes("Manager") || roles.includes("Admin"))
    return <Navigate to="/admin/orders" replace />;

  return <Navigate to="/login" replace />;
}
