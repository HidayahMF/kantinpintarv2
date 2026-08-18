import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

const App = () => {
  return (
    <div className="app">
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content" style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRouteAdmin><Dashboard /></ProtectedRouteAdmin>} />
            <Route path="/add" element={<ProtectedRouteAdmin><Add /></ProtectedRouteAdmin>} />
            <Route path="/list" element={<ProtectedRouteAdmin><List /></ProtectedRouteAdmin>} />
            <Route path="/orders" element={<ProtectedRouteAdmin><Orders /></ProtectedRouteAdmin>} />
            <Route path="/category" element={<ProtectedRouteAdmin><Category /></ProtectedRouteAdmin>} />
            <Route path="/list-category" element={<ProtectedRouteAdmin><ListCategory /></ProtectedRouteAdmin>} />
            <Route path="/customer-service" element={<ProtectedRouteAdmin><CustomerServiceAdmin /></ProtectedRouteAdmin>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
