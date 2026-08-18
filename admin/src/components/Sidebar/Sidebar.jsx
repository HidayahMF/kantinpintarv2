import React, { useContext } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import { toast } from "react-toastify";
import {
  FiLayout,
  FiPlusSquare,
  FiList,
  FiShoppingBag,
  FiTag,
  FiLayers,
  FiMessageSquare,
  FiLogOut,
  FiX,
} from "react-icons/fi";

const Sidebar = ({ open, onClose }) => {
  const { logout } = useContext(StoreContext);

  const handleLogout = () => {
    if (logout) logout();
    toast.success("Anda berhasil logout!");
  };

  const links = [
    { to: "/dashboard", icon: FiLayout, label: "Dashboard" },
    { to: "/add", icon: FiPlusSquare, label: "Add Items" },
    { to: "/list", icon: FiList, label: "Food List" },
    { to: "/orders", icon: FiShoppingBag, label: "Orders" },
    { to: "/category", icon: FiTag, label: "Add Food" },
    { to: "/list-category", icon: FiLayers, label: "Categories" },
    { to: "/customer-service", icon: FiMessageSquare, label: "Customer Service" },
  ];

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <FiX size={18} />
        </button>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/category"}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
