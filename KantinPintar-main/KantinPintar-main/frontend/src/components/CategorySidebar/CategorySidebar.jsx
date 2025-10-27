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
        const res = await API.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Karena backend return { success, data: categories }
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

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="category-sidebar">
      <select
        value={selectedCategory}
        onChange={(e) => onCategorySelect(e.target.value)}
      >
        <option value="All">All</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySidebar;
