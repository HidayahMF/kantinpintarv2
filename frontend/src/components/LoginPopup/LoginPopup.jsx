import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import axios from "axios";
import "./LoginPopup.css";

// Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

const LoginPopup = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { login } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Login"); // "Login" | "Sign Up" | "Admin"
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [notif, setNotif] = useState(null);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();

    let endpoint = "";
    let payload = {};

    if (currState === "Login") {
      endpoint = "/api/user/login";
      payload = { email: data.email, password: data.password };
    } else if (currState === "Sign Up") {
      endpoint = "/api/user/register";
      payload = { name: data.name, email: data.email, password: data.password };
    } else if (currState === "Admin") {
      endpoint = "/api/user/login-admin";
      payload = { email: data.email, password: data.password };
    }

    try {
      const res = await API.post(endpoint, payload);

      if (!res.data.success) {
        setNotif({
          msg: res.data.message || "Login/Register failed",
          type: "error",
        });
        setTimeout(() => setNotif(null), 1800);
        return;
      }

      // REGISTER SUCCESS
      if (currState === "Sign Up") {
        setCurrState("Login");
        setNotif({ msg: "Register berhasil! Silakan login.", type: "success" });
        setTimeout(() => setNotif(null), 2500);
        return;
      }

      // LOGIN ADMIN
      if (currState === "Admin") {
        setNotif({ msg: "Login sebagai Admin berhasil!", type: "admin" });
        const adminUrl = new URL("http://localhost:5174");
        adminUrl.searchParams.set("token", res.data.token);
        adminUrl.searchParams.set("isAdmin", "true");
        setTimeout(() => {
          window.location.href = adminUrl.toString();
        }, 1000);
        return;
      }

      // LOGIN USER
      login(res.data.token, false); // simpan token via context + localStorage
      setNotif({ msg: "Login sebagai User berhasil!", type: "user" });
      setTimeout(() => {
        setShowLogin(false);
        navigate("/");
      }, 1000);
    } catch (error) {
      setNotif({
        msg:
          error?.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan, coba lagi nanti.",
        type: "error",
      });
      setTimeout(() => setNotif(null), 1800);
    }
  };

  return (
    <div className="login-popup">
      {notif && (
        <div className={`notif-popup notif-${notif.type}`}>{notif.msg}</div>
      )}
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>
            {currState === "Sign Up"
              ? "Sign Up"
              : currState === "Admin"
              ? "Admin Login"
              : "Login"}
          </h2>
          <button type="button" onClick={() => setShowLogin(false)}>
            X
          </button>
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              value={data.name}
              onChange={onChangeHandler}
              required
              autoComplete="name"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={data.email}
            onChange={onChangeHandler}
            required
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={onChangeHandler}
            required
            autoComplete={
              currState === "Sign Up" ? "new-password" : "current-password"
            }
          />
        </div>

        <button type="submit">
          {currState === "Sign Up"
            ? "Create Account"
            : currState === "Admin"
            ? "Login as Admin"
            : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required id="terms" />
          <label htmlFor="terms">
            By continuing, I agree to the terms of use & privacy policy.
          </label>
        </div>

        {currState === "Login" && (
          <>
            <p>
              Create a new account?{" "}
              <span onClick={() => setCurrState("Sign Up")}>Click here</span>
            </p>
            <p>
              Sign in as admin?{" "}
              <span onClick={() => setCurrState("Admin")}>Click here</span>
            </p>
          </>
        )}

        {currState === "Sign Up" && (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login Here</span>
          </p>
        )}

        {currState === "Admin" && (
          <p>
            Back to user login?{" "}
            <span onClick={() => setCurrState("Login")}>Login user</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
