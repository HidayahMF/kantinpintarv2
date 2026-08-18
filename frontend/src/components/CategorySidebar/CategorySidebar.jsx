import React, { useEffect, useState } from "react";
import API from "../../api";
import { toast } from "react-toastify";
import "./CategorySidebar.css";

const CategorySidebar = ({ selectedCategory, onCategorySelect, token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/category/list");
        if (res.data.success) {
          setCategories(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch categories");
          toast.error(res.data.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Fetch categories error:", err);
        setError("Failed to fetch categories: " + err.message);
        toast.error("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token]);

  if (loading) {
    return (
      <div className="category-chips" aria-label="Category filter">
        <span className="skeleton" style={{ width: 64, height: 34 }} />
        <span className="skeleton" style={{ width: 80, height: 34 }} />
        <span className="skeleton" style={{ width: 72, height: 34 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-chips" aria-label="Category filter">
        <button
          className={`chip ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => onCategorySelect("All")}
        >
          All
        </button>
      </div>
    );
  }

  const options = [{ name: "All" }, ...categories];

  return (
    <div className="category-chips" aria-label="Category filter">
      {options.map((cat) => {
        const isActive = selectedCategory === cat.name;
        return (
          <button
            key={cat._id || cat.name}
            className={`chip ${isActive ? "active" : ""}`}
            onClick={() => onCategorySelect(cat.name)}
            aria-pressed={isActive}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategorySidebar;
