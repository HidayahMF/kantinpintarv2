import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../context/StoreContextProvider";
import API from "../../api";

const AdminPanel = () => {
  const { token, isAdmin, url, logout } = useContext(StoreContext);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const isAdminFromUrl = params.get("isAdmin");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
    }
    if (isAdminFromUrl) {
      localStorage.setItem("isAdmin", isAdminFromUrl);
      setIsAdmin(isAdminFromUrl === "true");
    }
  }, []);
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      try {
        const res = await API.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data.user);
      } catch {}
    };
    fetchMe();
  }, [token, url]);

  return (
    <div style={{ padding: 30 }}>
      <h2>Admin Panel</h2>
      <p>
        <b>Token:</b> <span style={{ wordBreak: "break-all" }}>{token}</span>
      </p>
      <p>
        <b>isAdmin:</b> {isAdmin ? "true" : "false"}
      </p>
      <p>
        <b>User Info:</b> {user ? JSON.stringify(user) : "Loading..."}
      </p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AdminPanel;
