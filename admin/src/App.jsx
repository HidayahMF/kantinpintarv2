import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Category from "./pages/Category/Category";
import ListCategory from "./pages/ListCategory/ListCategory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import CustomerServiceAdmin from "./pages/CustomerServiceAdmin/CustomerServiceAdmin";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";

const PAGE_TITLES = {
  "/dashboard": { title: "Dashboard", subtitle: "Ringkasan performa KantinGo." },
  "/add": { title: "Add Items", subtitle: "Tambahkan makanan baru ke menu." },
  "/list": { title: "Food List", subtitle: "Kelola semua makanan yang tersedia." },
  "/orders": { title: "Orders", subtitle: "Kelola dan pantau semua pesanan." },
  "/category": { title: "Add Food", subtitle: "Tambahkan makanan baru." },
  "/list-category": { title: "Categories", subtitle: "Kelola kategori menu." },
  "/customer-service": { title: "Customer Service", subtitle: "Balas pesan dari pelanggan." },
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: "KantinGo Admin",
    subtitle: "",
  };

  return (
    <div className="app">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" newestOnTop />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="app-content">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="app-main">
          <div className="page-head">
            <div>
              <h1 className="page-title">{pageInfo.title}</h1>
              <p className="page-subtitle">{pageInfo.subtitle}</p>
            </div>
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRouteAdmin>
                  <Dashboard />
                </ProtectedRouteAdmin>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRouteAdmin>
                  <Add />
                </ProtectedRouteAdmin>
              }
            />
            <Route
              path="/list"
              element={
                <ProtectedRouteAdmin>
                  <List />
                </ProtectedRouteAdmin>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRouteAdmin>
                  <Orders />
                </ProtectedRouteAdmin>
              }
            />
            <Route
              path="/category"
              element={
                <ProtectedRouteAdmin>
                  <Category />
                </ProtectedRouteAdmin>
              }
            />
            <Route
              path="/list-category"
              element={
                <ProtectedRouteAdmin>
                  <ListCategory />
                </ProtectedRouteAdmin>
              }
            />
            <Route
              path="/customer-service"
              element={
                <ProtectedRouteAdmin>
                  <CustomerServiceAdmin />
                </ProtectedRouteAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
