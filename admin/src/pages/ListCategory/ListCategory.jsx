import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import "./ListCategory.css";
import { StoreContext } from "../../context/StoreContextProvider";
import API from "../../api"; // ✅ gunakan axios instance

const CATEGORIES_PER_PAGE = 5;

const ListCategory = ({ token: tokenProp, onCategoriesChange }) => {
  const { url: urlContext, token: tokenContext } = useContext(StoreContext);
  const url = urlContext || "http://localhost:4000";

  const token = tokenProp || tokenContext;

  const [activeTab, setActiveTab] = useState("list");
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);
  const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;
  const currentCategories = categories.slice(
    startIndex,
    startIndex + CATEGORIES_PER_PAGE
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCategories(res.data.data || []);
      } else {
        throw new Error(res.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error(
        "Failed to load categories: " + (error.message || "Network error")
      );
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    try {
      let res;
      if (editId) {
        res = await API.put(
          `/category/${editId}`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await API.post(
          "/category/add",
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (res.data.success) {
        toast.success(editId ? "Category updated" : "Category added");
        setName("");
        setEditId(null);
        fetchCategories();
        onCategoriesChange && onCategoriesChange();
        setActiveTab("list");
      } else {
        throw new Error(res.data.message || "Failed to save category");
      }
    } catch (error) {
      toast.error(
        "Failed to save category: " + (error.message || "Network error")
      );
      console.error(error);
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditId(cat._id);
    setActiveTab("add");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await API.delete(`/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        toast.success("Category deleted");
        fetchCategories();
        onCategoriesChange && onCategoriesChange();
      } else {
        throw new Error(res.data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error(
        "Failed to delete category: " + (error.message || "Network error")
      );
      console.error(error);
    }
  };

  return (
    <div className="list-category">
      <div className="tab-buttons">
        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          ➕ Add Category
        </button>
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          📋 List Categories
        </button>
      </div>

      {activeTab === "add" && (
        <div className="add-category-form">
          <h2>{editId ? "Edit Category" : "Add New Category"}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button type="submit">{editId ? "Update" : "Add"}</button>
          </form>
        </div>
      )}

      {activeTab === "list" && (
        <div className="category-list-table">
          <h2>Category List</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((cat, index) => (
                <tr key={cat._id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{cat.name}</td>
                  <td>
                    <button onClick={() => handleEdit(cat)}>✏️</button>
                    <button onClick={() => handleDelete(cat._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {currentCategories.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "#aaa" }}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {categories.length > CATEGORIES_PER_PAGE && (
            <div
              className="pagination-controls"
              style={{ textAlign: "center", margin: "20px 0" }}
            >
              <button
                className="icon-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{ marginRight: 8, opacity: currentPage === 1 ? 0.5 : 1 }}
                title="Previous"
              >
                ⬅️
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="icon-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  marginLeft: 8,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
                title="Next"
              >
                ➡️
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListCategory;
