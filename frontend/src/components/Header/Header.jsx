import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { assets } from "../../assets/assets";
import { FiArrowRight, FiTruck } from "react-icons/fi";

const Header = () => {
  const navigate = useNavigate();

  const handleViewAllMenu = () => {
    navigate("/category/All");
  };

  return (
    <section className="hero">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Kantin Pintar — Online Ordering
          </span>
          <h1 className="hero-title">
            Good Food.
            <br />
            <span className="hero-title-accent">Easy Ordering.</span>
          </h1>
          <p className="hero-subtitle">
            From local favorites to international delights — browse your
            favorite dishes, order in seconds, and enjoy fast delivery to your
            doorstep.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={handleViewAllMenu}>
              Explore Menu
              <FiArrowRight size={18} />
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate("/customer-service")}
            >
              <FiTruck size={18} />
              Delivery Info
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <strong>50+</strong>
              <span>Menu Items</span>
            </div>
            <div>
              <strong>2.4k+</strong>
              <span>Orders Served</span>
            </div>
            <div>
              <strong>30 min</strong>
              <span>Avg. Delivery</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src={assets.header_img2}
            alt="Assorted dishes from the KantinGo menu"
            className="hero-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/header_img.png";
            }}
          />
          <div className="hero-float-card">
            <span className="hero-float-icon">
              <FiTruck size={18} />
            </span>
            <div>
              <strong>Fast Delivery</strong>
              <span>Tracked to your door</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
