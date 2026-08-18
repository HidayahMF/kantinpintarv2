import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./ListCategory.css";
import API from "../../api";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { FiPlus, FiList, FiEdit2, FiTrash2, FiTag } from "react-icons/fi";

const CATEGORIES_PER_PAGE = 5;

const ListCategory = ({ onCategoriesChange }) => {
  const [activeTab, setActiveTab] = useState("list");
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

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
      const res = await API.get("/category/list");
      if (res.data.success) {
        setCategories(res.data.data || []);
      } else {
        throw new Error(res.data.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("Failed to load categories: " + (error.message || "Network error"));
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    setSaving(true);
    try {
      let res;
      if (editId) {
        res = await API.put(`/category/${editId}`, { name });
      } else {
        res = await API.post("/category/add", { name });
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
      toast.error("Failed to save category: " + (error.message || "Network error"));
      console.error(error);
    }
    setSaving(false);
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditId(cat._id);
    setActiveTab("add");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await API.delete(`/category/${deleteTarget}`);
      if (res.data.success) {
        toast.success("Category deleted");
        fetchCategories();
        onCategoriesChange && onCategoriesChange();
      } else {
        throw new Error(res.data.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category: " + (error.message || "Network error"));
      console.error(error);
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="list-category">
      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("add");
            if (!editId) setName("");
          }}
        >
          <FiPlus size={15} />
          {editId ? "Edit Category" : "Add Category"}
        </button>
        <button
          className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("list");
            setEditId(null);
          }}
        >
          <FiList size={15} />
          List Categories
        </button>
      </div>

      {activeTab === "add" && (
        <div className="add-category-card card">
          <h2>{editId ? "Edit Category" : "Add New Category"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="cat-name">Category name</label>
              <input
                id="cat-name"
                className="input"
                type="text"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="btn-spinner" />
                    Saving...
                  </>
                ) : editId ? (
                  "Update Category"
                ) : (
                  "Add Category"
                )}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditId(null);
                    setName("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === "list" && (
        <div className="table-card">
          <div className="table-card-header">
            <h2>Category List</h2>
            <span className="badge badge-neutral">{categories.length} categories</span>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>No</th>
                  <th>Category</th>
                  <th style={{ textAlign: "center", width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCategories.map((cat, index) => (
                  <tr key={cat._id}>
                    <td className="muted-cell">{startIndex + index + 1}</td>
                    <td>
                      <span className="cat-name-cell">
                        <FiTag size={15} />
                        {cat.name}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="icon-btn edit"
                        onClick={() => handleEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeleteTarget(cat._id)}
                        aria-label={`Delete ${cat.name}`}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {currentCategories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty-cell">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {categories.length > CATEGORIES_PER_PAGE && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &larr; Prev
              </button>
              <span className="pagination-info">
                Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this category?"
          message="Kategori akan dihapus. Lanjutkan?"
          confirmText="Delete"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ListCategory;
