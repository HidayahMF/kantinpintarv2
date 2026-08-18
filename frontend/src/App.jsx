import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import FoodPage from "./pages/FoodPage/FoodPage";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Profile from "./components/Profile/Profile";
import CustomerService from "./components/CustomerService/CustomerService";
import DescReview from "./pages/DescReview/DescReview";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className="app-shell">
        <Navbar setShowLogin={setShowLogin} />
        <main className="app-main">
          <div className="app">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order" element={<PlaceOrder />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/myorder" element={<MyOrders />} />
              <Route path="/category/:categoryName" element={<FoodPage />} />
              <Route path="/food" element={<FoodPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/customer-service" element={<CustomerService />} />
              <Route path="/food/:id" element={<DescReview />} />
              <Route
                path="*"
                element={
                  <div className="state-box">
                    <div className="state-icon error">404</div>
                    <h3>Page not found</h3>
                    <p>Halaman yang kamu cari tidak ditemukan.</p>
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="colored"
        newestOnTop
      />
    </>
  );
};

export default App;
