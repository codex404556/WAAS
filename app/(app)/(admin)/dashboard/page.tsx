import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AccountPage from "@/pages/dashboard/AccountPage";
import UsersPage from "@/pages/dashboard/UsersPage";
import ProductsPage from "@/pages/dashboard/ProductsPage";
import CategoriesPage from "@/pages/dashboard/CategoriesPage";
import BrandsPage from "@/pages/dashboard/BrandsPage";
import OrdersPage from "@/pages/dashboard/Orders";
import BannersPage from "./pages/dashboard/BannersPage";
import InvoicePage from "./pages/dashboard/InvoicePage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-dashboard-theme">
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
