import React, { useEffect, useState } from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/assets";


const ExploreMenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");




  useEffect(() => {
    const fetchCategories = async () => {
      try {
       
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategories([]);
        return;
      }

      try {
       
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      }
    };

    fetchSubCategories();
  }, [selectedCategory]);

 
  const handleBack = () => {
    setCategory("All");
   
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <div className="explore-menu-header">
        <h1>Explore our menu</h1>
        
        {category !== "All" && (
          <button className="back-to-food-btn" onClick={handleBack}>
            &larr; Back to Food Display
          </button>
        )}
      </div>

      <p className="explore-menu-text">
        Choose from a wide variety of mouth-watering dishes across multiple categories –
        from local favorites to international delights.
      </p>

      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <div
              onClick={() =>
                setCategory((prev) =>
                  prev === item.menu_name ? "All" : item.menu_name
                )
              }
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category === item.menu_name ? "active" : ""}
                src={item.menu_image}
                alt=""
              />
              <p>{item.menu_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
