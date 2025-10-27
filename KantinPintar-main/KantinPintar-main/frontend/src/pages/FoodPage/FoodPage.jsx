import React, { useContext, useEffect, useState } from "react";
import "./FoodPage.css";
import CategorySidebar from "../../components/CategorySidebar/CategorySidebar";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import { useParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";

const FoodPage = () => {
  const { categoryName } = useParams();
  const { foodList, url, fetchFoodList } = useContext(StoreContext);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (categoryName) {
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory("All");
    }
  }, [categoryName]);

  useEffect(() => {
    fetchFoodList();
  }, []);

  return (
    <div className="food-page">
      <div className="sidebar">
        <CategorySidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          apiUrl={url}
        />
      </div>
      <div className="food-display-wrapper">
        <FoodDisplay foods={foodList} selectedCategory={selectedCategory} />
      </div>
    </div>
  );
};

export default FoodPage;
