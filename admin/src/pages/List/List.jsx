import React, { useContext, useEffect, useState, useRef } from "react";
import "./List.css";
import { toast } from "react-toastify";
import API from "../../api";
import { StoreContext } from "../../context/StoreContextProvider";
import { formatRp } from "../../utils/format";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { FiEdit2, FiTrash2, FiX, FiSearch } from "react-icons/fi";

const FOODS_PER_PAGE = 5;

const List = () => {
  const { url } = useContext(StoreContext);
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });
  const [editImage, setEditImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const previewUrlRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const filteredList = list.filter((item) =>
    (item.name || "").toLowerCase().includes(search.trim().toLowerCase())
  );
  const totalPages = Math.ceil(filteredList.length / FOODS_PER_PAGE);

  const sortedList = [...filteredList].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const startIndex = (currentPage - 1) * FOODS_PER_PAGE;
  const currentFoods = sortedList.slice(startIndex, startIndex + FOODS_PER_PAGE);

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, []);

  // Close edit modal on Escape
  useEffect(() => {
    if (!editItem) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setEditItem(null);
        setEditImage(null);
        setPreviewImage(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editItem]);

  const fetchList = async ({ keepPage = false } = {}) => {
    try {
      const res = await API.get("/food/list");
      if (Array.isArray(res.data)) setList(res.data);
      else if (res.data?.success && Array.isArray(res.data.data))
        setList(res.data.data);
      else setList([]);
      if (!keepPage) setCurrentPage(1);
    } catch (err) {
      console.error("Fetch foods error:", err);
      toast.error("Server error while fetching foods");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/list");
      if (Array.isArray(res.data)) setCategories(res.data);
      else setCategories(res.data?.data || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
      toast.error("Failed to fetch categories");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await API.delete(`/food/remove/${deleteTarget}`);
      if (res.data.success) {
        toast.success("Food removed");
        fetchList({ keepPage: true });
      } else {
        toast.error(res.data.message || "Failed to remove food");
      }
    } catch (err) {
      console.error("Remove food error:", err);
      toast.error("Server error while removing food");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleEditClick = (item) => {
    setEditItem(item._id);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock !== undefined ? item.stock : "",
    });
    setPreviewImage(
      `${url}${item.image?.startsWith("/") ? item.image : `/uploads/${item.image}`}`
    );
    setEditImage(null);
  };

  const handleUpdate = async () => {
    if (formData.stock === "" || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      toast.error("Stock harus diisi (minimal 0)");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("category", formData.category);
      fd.append("price", formData.price);
      fd.append("stock", formData.stock);
      if (editImage) fd.append("image", editImage);

      const res = await API.put(`/food/update/${editItem}`, fd);

      if (res.data.success) {
        toast.success("Updated successfully");
        setEditItem(null);
        setEditImage(null);
        setPreviewImage(null);
        fetchList({ keepPage: true });
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update food error:", err);
      toast.error("Server error while updating food");
    }
  };

  const imgSrc = (item) =>
    `${url}${item.image?.startsWith("/") ? item.image : `/uploads/${item.image}`}`;

  return (
    <div className="list-page">
      <div className="table-card">
        <div className="table-card-header">
          <h2>All Foods</h2>
          <div className="list-search">
            <FiSearch size={15} />
            <input
              type="search"
              placeholder="Cari makanan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search food"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="table-responsive desktop-table">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentFoods.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No food data found.
                  </td>
                </tr>
              )}
              {currentFoods.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={imgSrc(item)}
                      alt={item.name}
                      className="table-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-food.png";
                      }}
                    />
                  </td>
                  <td className="food-name-cell">{item.name}</td>
                  <td>
                    <span className="badge badge-neutral">{item.category}</span>
                  </td>
                  <td className="price-tag">{formatRp(item.price)}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.stock === 0 ? "badge-error" : "badge-success"
                      }`}
                    >
                      {item.stock === 0 ? "Out of stock" : `Stock: ${item.stock}`}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="icon-btn edit"
                      onClick={() => handleEditClick(item)}
                      title="Edit"
                      aria-label={`Edit ${item.name}`}
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => setDeleteTarget(item._id)}
                      title="Delete"
                      aria-label={`Delete ${item.name}`}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="mobile-food-list">
          {currentFoods.length === 0 && (
            <div className="state-box">
              <p>No food data found.</p>
            </div>
          )}
          {currentFoods.map((item) => (
            <div key={item._id} className="mobile-food-card">
              <img src={imgSrc(item)} alt={item.name} className="mobile-food-img" />
              <div className="mobile-food-info">
                <strong>{item.name}</strong>
                <span className="badge badge-neutral">{item.category}</span>
                <span className="mobile-food-price">{formatRp(item.price)}</span>
                <span
                  className={`badge ${
                    item.stock === 0 ? "badge-error" : "badge-success"
                  }`}
                >
                  {item.stock === 0 ? "Out of stock" : `Stock: ${item.stock}`}
                </span>
              </div>
              <div className="mobile-food-actions">
                <button
                  className="icon-btn edit"
                  onClick={() => handleEditClick(item)}
                  aria-label={`Edit ${item.name}`}
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  className="icon-btn danger"
                  onClick={() => setDeleteTarget(item._id)}
                  aria-label={`Delete ${item.name}`}
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredList.length > FOODS_PER_PAGE && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              &larr; Prev
            </button>
            <span className="pagination-info">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay">
          <div className="edit-modal card" role="dialog" aria-modal="true" aria-label="Edit food">
            <div className="edit-modal-header">
              <h3>Edit Food</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setEditItem(null);
                  setEditImage(null);
                  setPreviewImage(null);
                }}
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="edit-modal-body">
              <div className="form-field">
                <label htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  className="input"
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  className="select"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="edit-price">Price</label>
                  <input
                    id="edit-price"
                    className="input"
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="edit-stock">Stock</label>
                  <input
                    id="edit-stock"
                    className="input"
                    type="number"
                    placeholder="Stock"
                    value={formData.stock}
                    min="0"
                    step="1"
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Image</label>
                <label className="file-upload">
                  <span>Upload new image</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      setEditImage(e.target.files[0]);
                      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                      const objectUrl = URL.createObjectURL(e.target.files[0]);
                      previewUrlRef.current = objectUrl;
                      setPreviewImage(objectUrl);
                    }}
                  />
                </label>
                {previewImage && (
                  <img src={previewImage} alt="preview" className="edit-preview-img" />
                )}
              </div>
            </div>

            <div className="edit-modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setEditItem(null);
                  setEditImage(null);
                  setPreviewImage(null);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                Update Food
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this food?"
          message="Makanan akan dihapus dari menu. Lanjutkan?"
          confirmText="Delete"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default List;
