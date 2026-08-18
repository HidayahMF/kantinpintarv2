import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import API from "../../api";
import "./LoginPopup.css";
import { FiX, FiEye, FiEyeOff, FiShield, FiUser } from "react-icons/fi";
import { assets } from "../../assets/assets";

const LoginPopup = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { login } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Login"); // "Login" | "Sign Up" | "Admin"
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowLogin(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setShowLogin]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const switchState = (state) => {
    setCurrState(state);
    setError("");
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let endpoint = "";
    let payload = {};

    if (currState === "Login") {
      endpoint = "/user/login";
      payload = { email: data.email, password: data.password };
    } else if (currState === "Sign Up") {
      endpoint = "/user/register";
      payload = { name: data.name, email: data.email, password: data.password };
    } else if (currState === "Admin") {
      endpoint = "/user/login-admin";
      payload = { email: data.email, password: data.password };
    }

    try {
      const res = await API.post(endpoint, payload);

      if (!res.data.success) {
        setError(res.data.message || "Login/Register failed");
        setLoading(false);
        return;
      }

      // REGISTER SUCCESS
      if (currState === "Sign Up") {
        setCurrState("Login");
        setError("");
        setLoading(false);
        return;
      }

      // LOGIN ADMIN
      if (currState === "Admin") {
        const adminUrl = new URL(
          import.meta.env.VITE_ADMIN_URL || "http://localhost:5174"
        );
        adminUrl.searchParams.set("token", res.data.token);
        adminUrl.searchParams.set("isAdmin", "true");
        window.location.href = adminUrl.toString();
        return;
      }

      // LOGIN USER
      login(res.data.token, false);
      setShowLogin(false);
      navigate("/");
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan, coba lagi nanti."
      );
      setLoading(false);
    }
  };

  const title =
    currState === "Sign Up"
      ? "Create your account"
      : currState === "Admin"
      ? "Admin Sign In"
      : "Welcome back";

  return (
    <div className="login-overlay" onClick={() => setShowLogin(false)}>
      <div
        className="login-popup card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="login-close"
          onClick={() => setShowLogin(false)}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>

        <div className="login-brand">
          <img src={assets.logokantin} alt="KantinGo" />
          <h2>{title}</h2>
          <p>
            {currState === "Admin"
              ? "Sign in to manage the KantinGo dashboard."
              : "Masuk untuk memesan makanan favoritmu."}
          </p>
        </div>

        <div className="login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={currState === "Login"}
            className={currState === "Login" ? "active" : ""}
            onClick={() => switchState("Login")}
          >
            <FiUser size={14} /> Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currState === "Sign Up"}
            className={currState === "Sign Up" ? "active" : ""}
            onClick={() => switchState("Sign Up")}
          >
            Sign Up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currState === "Admin"}
            className={currState === "Admin" ? "active" : ""}
            onClick={() => switchState("Admin")}
          >
            <FiShield size={14} /> Admin
          </button>
        </div>

        <form onSubmit={onLogin} className="login-form" noValidate>
          {currState === "Sign Up" && (
            <div className="form-field">
              <label htmlFor="login-name">Your Name</label>
              <input
                id="login-name"
                className="input"
                name="name"
                type="text"
                placeholder="Your Name"
                value={data.name}
                onChange={onChangeHandler}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={data.email}
              onChange={onChangeHandler}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <div className="password-wrap">
              <input
                id="login-password"
                className="input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={data.password}
                onChange={onChangeHandler}
                required
                autoComplete={
                  currState === "Sign Up" ? "new-password" : "current-password"
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          {currState === "Sign Up" ? (
            <p className="login-terms">
              By continuing, I agree to the{" "}
              <span>terms of use &amp; privacy policy.</span>
            </p>
          ) : (
            <div className="login-terms login-terms-check">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                By continuing, I agree to the terms of use &amp; privacy policy.
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                {currState === "Sign Up"
                  ? "Creating account..."
                  : currState === "Admin"
                  ? "Signing in..."
                  : "Signing in..."}
              </>
            ) : currState === "Sign Up" ? (
              "Create Account"
            ) : currState === "Admin" ? (
              "Login as Admin"
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="login-switch">
          {currState === "Login" && (
            <>
              <p>
                Create a new account?{" "}
                <span onClick={() => switchState("Sign Up")}>Sign up here</span>
              </p>
              <p>
                Sign in as admin?{" "}
                <span onClick={() => switchState("Admin")}>Admin login</span>
              </p>
            </>
          )}
          {currState === "Sign Up" && (
            <p>
              Already have an account?{" "}
              <span onClick={() => switchState("Login")}>Login here</span>
            </p>
          )}
          {currState === "Admin" && (
            <p>
              Back to user login?{" "}
              <span onClick={() => switchState("Login")}>Login as user</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
