import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContextProvider";

const ITEMS_PER_PAGE = 12;

const FoodDisplay = ({ selectedCategory }) => {
  const { foodList } = useContext(StoreContext);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!Array.isArray(foodList)) return;
    let temp = foodList;
    if (selectedCategory && selectedCategory !== "All") {
      temp = foodList.filter((item) => item.category === selectedCategory);
    }
    setFiltered(temp);
    setPage(1);
  }, [foodList, selectedCategory]);

  if (!foodList || foodList.length === 0)
    return <p>Loading or no food items available.</p>;

  if (filtered.length === 0)
    return <p>No food items found in "{selectedCategory}" category.</p>;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="food-display">
      <div className="food-display-list">
        {currentItems.map((food) => (
          <FoodItem
            key={food._id}
            id={food._id}
            name={food.name}
            description={food.description}
            price={food.price}
            image={food.image}
            stock={food.stock}
          />
        ))}
      </div>

      {filtered.length > ITEMS_PER_PAGE && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            &lt; Prev
          </button>
          <span>
            Page <b>{page}</b> of <b>{totalPages}</b>
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
