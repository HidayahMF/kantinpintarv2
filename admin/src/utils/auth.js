const CUSTOMER_FRONTEND_URL = import.meta.env.VITE_CUSTOMER_URL || "http://localhost:5173";

export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("cartItems");
  window.location.href = CUSTOMER_FRONTEND_URL;
};