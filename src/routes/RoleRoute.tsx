import { Navigate, Outlet } from "react-router-dom";
import { useMeQuery } from "../features/auth/authApi";
import { useAppSelector } from "../app/hooks";

function getDefaultRouteByRoles(userRoles: string[]) {
  if (userRoles.includes("Customer")) return "/products";
  if (userRoles.includes("Courier")) return "/courier/orders";
  if (userRoles.includes("Manager") || userRoles.includes("Admin")) {
    return "/admin/orders";
  }
  return "/products";
}

export function RoleRoute({ roles }: { roles: string[] }) {
  const token = useAppSelector((s) => s.auth.accessToken);
  const me = useAppSelector((s) => s.auth.me);

  const { isLoading, isFetching } = useMeQuery(undefined, {
    skip: !token || !!me,
  });

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!me && (isLoading || isFetching)) {
    return <div>Загрузка...</div>;
  }

  if (!me) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = roles.some((role) => me.roles.includes(role));

  if (!hasAccess) {
    return <Navigate to={getDefaultRouteByRoles(me.roles)} replace />;
  }

  return <Outlet />;
}
