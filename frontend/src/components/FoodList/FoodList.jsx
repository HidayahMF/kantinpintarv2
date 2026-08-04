import React, { useContext } from "react";
import "./FoodList.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContextProvider";

const FoodList = ({ selectedCategory }) => {
  const { foodList, url } = useContext(StoreContext);

  if (!foodList) {
    return <p>Loading...</p>;
  }

  // Filter berdasarkan kategori
  const filteredFoods =
    selectedCategory && selectedCategory !== "All"
      ? foodList.filter((food) => food.category === selectedCategory)
      : foodList;

  return (
    <div className="food-list">
      {filteredFoods.length > 0 ? (
        filteredFoods.map((food) => (
          <FoodItem
            key={food._id}
            id={food._id}
            name={food.name}
            price={food.price}
            description={food.description}
            image={food.image.startsWith("http") ? food.image : `${url}${food.image}`}
            stock={food.stock}
          />
        ))
      ) : (
        <p>There are no foods or drinks in this category.</p>
      )}
    </div>
  );
};

export default FoodList;
