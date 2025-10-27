import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContextProvider";
import jwtDecode from "jwt-decode";

export default function ProtectedRouteAdmin({ children }) {
  const { token } = useContext(StoreContext); 
  if (!token) return <Navigate to="/login" replace />;
  try {
    const decoded = jwtDecode(token);
    if (decoded.isAdmin) return children;
    return <Navigate to="/login" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}
