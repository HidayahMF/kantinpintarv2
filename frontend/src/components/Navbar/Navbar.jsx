import React, { useContext, useEffect, useRef, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import { toast } from "react-toastify";
import {
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiMessageCircle,
  FiHome,
  FiList,
  FiChevronDown,
} from "react-icons/fi";

const Navbar = ({ setShowLogin }) => {
  const { token, logout, cartItems, user, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);

  const cartCount = Object.values(cartItems || {}).reduce(
    (sum, qty) => sum + (Number(qty) || 0),
    0
  );

  const avatar = user?.avatar
    ? `${url}/uploads/${user.avatar}`
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (logout) logout();
    setShowDropdown(false);
    setMobileOpen(false);
    toast.success("Anda berhasil logout!");
    navigate("/");
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      setTimeout(() => {
        const el = document.getElementById("explore-menu");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      navigate("/category/All");
    }
  };

  const navLink = (to, label, icon, activePaths, onClick) => {
    const isActive = activePaths.some((p) =>
      p === "/" ? location.pathname === "/" : location.pathname.startsWith(p)
    );
    return (
      <Link
        to={to}
        className={`nav-link ${isActive ? "active" : ""}`}
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  };

  const userActions = (
    <>
      <Link to="/cart" className="nav-cart" aria-label="Cart">
        <FiShoppingBag size={20} />
        {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
      </Link>

      {!token ? (
        <button
          className="btn btn-primary nav-login-btn"
          onClick={() => setShowLogin(true)}
        >
          Sign In
        </button>
      ) : (
        <div className="nav-profile" ref={dropdownRef}>
          <button
            className="nav-profile-btn"
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label="Account menu"
            aria-expanded={showDropdown}
          >
            {avatar ? (
              <img src={avatar} alt={user?.name || "user"} />
            ) : (
              <span className="nav-profile-fallback">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </span>
            )}
            <FiChevronDown size={14} />
          </button>

          {showDropdown && (
            <ul className="nav-profile-dropdown fade-in">
              <li onClick={() => navigate("/profile")}>
                <FiUser size={16} />
                <p>Profile</p>
              </li>
              <li onClick={() => navigate("/myorder")}>
                <FiPackage size={16} />
                <p>Orders</p>
              </li>
              <li onClick={() => navigate("/customer-service")}>
                <FiMessageCircle size={16} />
                <p>Customer Service</p>
              </li>
              <li className="logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                <p>Logout</p>
              </li>
            </ul>
          )}
        </div>
      )}
    </>
  );

  const mobileLinks = (
    <>
      <Link to="/" className="mobile-link">
        <FiHome size={17} />
        Home
      </Link>
      <a
        href="/#explore-menu"
        className="mobile-link"
        onClick={handleMenuClick}
      >
        <FiList size={17} />
        Menu
      </a>
      <Link to="/myorder" className="mobile-link">
        <FiPackage size={17} />
        Orders
      </Link>
      <Link to="/customer-service" className="mobile-link">
        <FiMessageCircle size={17} />
        Customer Service
      </Link>
      {!token && (
        <button
          className="btn btn-primary btn-block"
          onClick={() => setShowLogin(true)}
        >
          Sign In
        </button>
      )}
      {token && (
        <button className="btn btn-ghost btn-block" onClick={handleLogout}>
          <FiLogOut size={16} />
          Logout
        </button>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" aria-label="KantinGo home">
          <img src={assets.logokantin} alt="KantinGo" className="logo" />
        </Link>

        <nav className="navbar-menu" aria-label="Main navigation">
          {navLink("/", "Home", <FiHome size={17} />, ["/"])}
          {navLink(
            "/category/All",
            "Menu",
            <FiList size={17} />,
            ["/category", "/food"],
            handleMenuClick
          )}
          {navLink("/myorder", "Orders", <FiPackage size={17} />, ["/myorder"])}
          {navLink(
            "/customer-service",
            "Customer Service",
            <FiMessageCircle size={17} />,
            ["/customer-service"]
          )}
        </nav>

        <div className="navbar-actions">{userActions}</div>

        <button
          className="navbar-burger"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="navbar-mobile fade-in" ref={mobileRef}>
          {mobileLinks}
        </div>
      )}
    </header>
  );
};

export default Navbar;
