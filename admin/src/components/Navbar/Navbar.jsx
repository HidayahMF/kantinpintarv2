import React, { useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContextProvider";
import { toast } from "react-toastify";
import { FiMenu, FiLogOut, FiShield } from "react-icons/fi";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(StoreContext);

  const handleLogout = () => {
    if (logout) logout();
    toast.success("Anda berhasil logout!");
  };

  return (
    <header className="topbar">
      <button
        className="topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <FiMenu size={20} />
      </button>

      <div className="topbar-brand">
        <img src={assets.logokantin} alt="KantinGo" className="topbar-logo" />
        <span className="topbar-brand-name">KantinGo Admin</span>
      </div>

      <div className="topbar-right">
        <span className="topbar-user">
          <span className="topbar-user-icon">
            <FiShield size={15} />
          </span>
          <span className="topbar-user-name">
            {user?.name || "Admin"}
          </span>
        </span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          <FiLogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
