import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { RoleRoute } from "./routes/RoleRoute";
import { ProductsPage } from "./pages/user/ProductsPage";
import { CartPage } from "./pages/user/CartPage";
import { MyOrdersPage } from "./pages/user/MyOrdersPage";
import { ProductDetailsPage } from "./pages/user/ProductDetailsPage";
import { CourierOrdersPage } from "./pages/courier/CourierOrdersPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminEmployeesPage } from "./pages/admin/AdminEmployeesPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { HomeRedirect } from "./pages/HomeRedirect";

export function Router() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* CUSTOMER */}
        <Route element={<RoleRoute roles={["Customer"]} />}>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* COURIER */}
        <Route element={<RoleRoute roles={["Courier"]} />}>
          <Route path="/courier/orders" element={<CourierOrdersPage />} />
        </Route>

        {/* MANAGER/ADMIN */}
        <Route element={<RoleRoute roles={["Manager", "Admin"]} />}>
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        </Route>

        {/* ADMIN ONLY */}
        <Route element={<RoleRoute roles={["Admin"]} />}>
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
