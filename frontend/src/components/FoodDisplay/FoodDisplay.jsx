import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContextProvider";
import { FiSearch, FiInbox } from "react-icons/fi";

const ITEMS_PER_PAGE = 12;

const FoodDisplay = ({ selectedCategory }) => {
  const { foodList } = useContext(StoreContext);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!Array.isArray(foodList)) return;
    let temp = foodList;
    if (selectedCategory && selectedCategory !== "All") {
      temp = foodList.filter((item) => item.category === selectedCategory);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      temp = temp.filter((item) =>
        (item.name || "").toLowerCase().includes(q)
      );
    }
    setFiltered(temp);
    setPage(1);
  }, [foodList, selectedCategory, search]);

  if (!foodList || foodList.length === 0) {
    return (
      <div className="state-box">
        <div className="state-icon">
          <FiInbox size={24} />
        </div>
        <h3>Menu belum tersedia</h3>
        <p>Belum ada makanan yang dapat ditampilkan saat ini. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="state-box">
        <div className="state-icon">
          <FiSearch size={24} />
        </div>
        <h3>Tidak ada hasil</h3>
        <p>
          Tidak ada makanan yang cocok dengan pencarian atau kategori
          &ldquo;{selectedCategory}&rdquo;. Coba kata kunci lain.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <section className="food-display">
      <div className="food-display-head">
        <div>
          <h2>{selectedCategory === "All" ? "Our Menu" : selectedCategory}</h2>
          <p>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} tersedia
          </p>
        </div>
        <div className="food-search">
          <FiSearch size={16} />
          <input
            type="search"
            placeholder="Cari makanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search food"
          />
        </div>
      </div>

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
            category={food.category}
          />
        ))}
      </div>

      {filtered.length > ITEMS_PER_PAGE && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            &larr; Prev
          </button>
          <span className="pagination-info">
            Page <b>{page}</b> of <b>{totalPages}</b>
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </section>
  );
};

export default FoodDisplay;
