import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <img
            src={assets.dashboard}
            alt="Dashboard Icon"
            className="sidebar-icon"
          />
          <p>Dashboard</p>
        </NavLink>
        <NavLink
          to="/add"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <img src={assets.add_icon} alt="Add Icon" className="sidebar-icon" 
           style={{ cursor: "pointer", width: "23px", height: "23px" }}/>
          <p>Add Items</p>
        </NavLink>

        <NavLink
          to="/list"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <img src={assets.list} alt="List Icon" className="sidebar-icon" />
          <p>List Items</p>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <img src={assets.order_icon} alt="Orders Icon" className="sidebar-icon" 
          style={{ cursor: "pointer", width: "23px", height: "23px" }}/>
          <p>Orders</p>
        </NavLink>

        <NavLink
          to="/category"
          end
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <img
            src={assets.category}
            alt="Category Icon"
            className="sidebar-icon"
          />
          <p>Category</p>
        </NavLink>

        <NavLink
          to="/list-category"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <img
            src={assets.list}
            alt="List Category Icon"
            className="sidebar-icon"
          />
          <p>List Category</p>
        </NavLink>
        <NavLink
          to="/customer-service"
          className={({ isActive }) =>
            isActive ? "sidebar-option active" : "sidebar-option"
          }
        >
          <img
            src={assets.customer}
            alt="Customer Service Icon"
            className="sidebar-icon"
          />
          <p>Customer Service</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
