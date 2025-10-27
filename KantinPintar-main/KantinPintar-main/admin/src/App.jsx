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

const App = () => {
  const url = "http://localhost:4000";
 console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);

  return (
    <div className="app">
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content" style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "20px" }}>
          <Routes>
            
            <Route path="/" element={<Navigate to="/add" replace />} />
            <Route path="/dashboard" element={<Dashboard url={url} />} />
            <Route path="/add" element={<Add url={url} />} />
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Orders url={url} />} />
            <Route path="/category" element={<Category url={url} />} />
            <Route path="/list-category" element={<ListCategory url={url} />} />
            <Route path="/customer-service" element={<CustomerServiceAdmin url={url} />} />
            
            
            <Route path="*" element={<Navigate to="/add" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
