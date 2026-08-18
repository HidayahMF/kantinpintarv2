import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContextProvider";

const CUSTOMER_FRONTEND_URL = import.meta.env.VITE_CUSTOMER_URL || "http://localhost:5173";

export default function ProtectedRouteAdmin({ children }) {
  const { token, isAdmin } = useContext(StoreContext);

  if (!token) {
    return <Navigate to={CUSTOMER_FRONTEND_URL} replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired || !isAdmin) {
      return <Navigate to={CUSTOMER_FRONTEND_URL} replace />;
    }
  } catch {
    return <Navigate to={CUSTOMER_FRONTEND_URL} replace />;
  }

  return children;
}
