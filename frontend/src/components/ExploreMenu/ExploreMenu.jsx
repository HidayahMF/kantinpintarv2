import React from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  const handleBack = () => {
    setCategory("All");
  };

  return (
    <section className="explore-menu" id="explore-menu">
      <div className="section-head">
        <div>
          <h2>Explore our menu</h2>
          <p>
            Choose from a wide variety of mouth-watering dishes across multiple
            categories — from local favorites to international delights.
          </p>
        </div>
        {category !== "All" && (
          <button className="btn btn-ghost btn-sm" onClick={handleBack}>
            ← Back to All
          </button>
        )}
      </div>

      <div className="explore-menu-list" role="list">
        {menu_list.map((item, index) => {
          const isActive = category === item.menu_name;
          return (
            <button
              role="listitem"
              onClick={() =>
                setCategory((prev) =>
                  prev === item.menu_name ? "All" : item.menu_name
                )
              }
              key={index}
              className={`explore-menu-list-item ${isActive ? "active" : ""}`}
              aria-pressed={isActive}
            >
              <span className="explore-menu-img-wrap">
                <img
                  className={isActive ? "active" : ""}
                  src={item.menu_image}
                  alt={item.menu_name}
                  loading="lazy"
                />
              </span>
              <p>{item.menu_name}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ExploreMenu;
