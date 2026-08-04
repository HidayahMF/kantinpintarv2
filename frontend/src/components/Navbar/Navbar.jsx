import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("menu");
  const [showDropdown, setShowDropdown] = useState(false);
  const [notif, setNotif] = useState(null);

  const { getTotalCartAmount, token, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (logout) logout();
    setShowDropdown(false);
    setNotif("Anda berhasil logout!");
    setTimeout(() => setNotif(null), 2000); 
    navigate("/");
  };

 
  const handleMenuClick = (menuKey, hash) => (e) => {
    e.preventDefault();
    setMenu(menuKey);
    if (location.pathname === "/") {
   
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      
      navigate(`/#${hash}`);
    }
  };

  return (
    <div className="navbar">
     
      {notif && (
        <div className="navbar-notif-popup">
          <span>{notif}</span>
        </div>
      )}

      <Link to="/">
        <img src={assets.logokantin} alt="logo" className="logo" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          home
        </Link>
        <a
          href="/#explore-menu"
          onClick={handleMenuClick("menu", "explore-menu")}
          className={menu === "menu" ? "active" : ""}
        >
          menu
        </a>
        <a
          href="/#app-download"
          onClick={handleMenuClick("mobile-app", "app-download")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          mobile-app
        </a>
        <a
          href="/#footer"
          onClick={handleMenuClick("contact-us", "footer")}
          className={menu === "contact-us" ? "active" : ""}
        >
          contact-us
        </a>
      </ul>

      <div className="navbar-right">
        {token && (
          <div className="navbar-search-icon">
            <Link to="/cart">
              <img
                src={assets.basket_icon || "/default-basket.png"}
                alt="basket"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-basket.png";
                }}
              />
            </Link>
            {getTotalCartAmount() !== 0 && <div className="dot"></div>}
          </div>
        )}

        {!token ? (
          <button onClick={() => setShowLogin(true)}>sign in</button>
        ) : (
          <div className="navbar-profile">
            <img
              src={assets.settingv2 || "/settingv2.png"}
              alt="profile"
              onClick={() => setShowDropdown((prev) => !prev)}
              style={{ cursor: "pointer", width: "60px", height: "60px" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "settingv2.png";
              }}
            />
            {showDropdown && (
              <ul className="nav-profile-dropdown">
                <li
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/Profile");
                  }}
                >
                  <img
                    src={assets.usercircle || "/usercircle.png"}
                    alt="profile"
                    style={{ width: "30px", height: "30px" }}
                  />
                  <p>Profile</p>
                </li>
                <hr />
                <li
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/myorder");
                  }}
                >
                  <img
                    src={assets.order || "/order.png"}
                    alt="orders"
                    style={{ width: "30px", height: "30px" }}
                  />
                  <p>Orders</p>
                </li>
                <hr />
                <li
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/customer-service");
                  }}
                >
                  <img
                    src={assets.customer || "/customer.png"}
                    alt="orders"
                    style={{ width: "30px", height: "30px" }}
                  />
                  <p>Customer Service</p>
                </li>
                <hr />
                <li onClick={handleLogout}>
                  <img
                    src={assets.logout_icon || "/default-logout.png"}
                    alt="logout"
                    style={{ width: "30px", height: "30px" }}
                  />
                  <p>Logout</p>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
