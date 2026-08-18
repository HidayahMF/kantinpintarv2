import React, { useContext, useEffect, useState } from "react";
import "./FoodPage.css";
import CategorySidebar from "../../components/CategorySidebar/CategorySidebar";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import { useParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";

const FoodPage = () => {
  const { categoryName } = useParams();
  const { foodList, fetchFoodList } = useContext(StoreContext);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setSelectedCategory(categoryName || "All");
  }, [categoryName]);

  useEffect(() => {
    fetchFoodList();
  }, []);

  return (
    <div className="food-page">
      <div className="food-page-head">
        <h1 className="page-title">Menu</h1>
        <p className="page-subtitle">
          Pilih kategori favoritmu atau cari makanan yang kamu inginkan.
        </p>
      </div>

      <CategorySidebar
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <div className="food-display-wrapper">
        <FoodDisplay foods={foodList} selectedCategory={selectedCategory} />
      </div>
    </div>
  );
};

export default FoodPage;
