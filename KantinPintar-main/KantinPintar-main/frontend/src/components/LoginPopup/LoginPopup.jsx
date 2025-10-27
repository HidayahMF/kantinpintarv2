import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import axios from "axios";
import "./LoginPopup.css";

// Buat instance axios agar rapi dan tidak perlu tulis url berulang-ulang
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

const LoginPopup = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { login } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

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

      if (res.data.success) {
        if (currState === "Sign Up") {
          setCurrState("Login");
          setNotif({
            msg: "Register berhasil! Silakan login.",
            type: "success",
          });
          setTimeout(() => setNotif(null), 2500);
          return;
        }

        if (res.data.isAdmin) {
          setNotif({
            msg: "Anda Berhasil Login sebagai Admin!",
            type: "admin",
          });
          setTimeout(() => {
            window.location.href = `http://localhost:5174?token=${res.data.token}&isAdmin=true`;
          }, 1000);
        } else {
          login(res.data.token, false);
          setNotif({ msg: "Anda Berhasil Login sebagai User!", type: "user" });
          setTimeout(() => {
            setShowLogin(false);
            navigate("/");
          }, 1000);
        }
      } else {
        setNotif({
          msg: res.data.message || "Login/Register failed",
          type: "error",
        });
        setTimeout(() => setNotif(null), 1800);
      }
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
