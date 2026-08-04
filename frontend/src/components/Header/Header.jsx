import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleViewAllMenu = () => {
    navigate("/category/All");  
  };

  return (
    <div className="header">
      <div className="header-contents">
        <h2>Order your favourite food here</h2>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes
          crafted with the finest ingredients.
        </p>
        <button onClick={handleViewAllMenu}>View All Menu</button>
      </div>
    </div>
  );
};

export default Header;
