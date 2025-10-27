import React, { useEffect, useState } from "react";
import "./List.css";
import { toast } from "react-toastify";
import API from "../../api"; // pastikan path sesuai dengan struktur folder kamu

const FOODS_PER_PAGE = 5;

const List = () => {
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

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(list.length / FOODS_PER_PAGE);

  // Urutkan berdasarkan waktu terbaru
  const sortedList = [...list].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const startIndex = (currentPage - 1) * FOODS_PER_PAGE;
  const currentFoods = sortedList.slice(
    startIndex,
    startIndex + FOODS_PER_PAGE
  );

  useEffect(() => {
    fetchList();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  // 🔹 Ambil daftar makanan
  const fetchList = async ({ keepPage = false } = {}) => {
    try {
      const res = await API.get("/food/list");
      setList(res.data.data || []);
      if (!keepPage) setCurrentPage(1);
    } catch (err) {
      toast.error("Server error");
    }
  };

  // 🔹 Ambil daftar kategori
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/list");
      setCategories(res.data.data || []);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  // 🔹 Hapus makanan
  const removeFood = async (foodId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await API.delete(`/food/remove/${foodId}`);
      if (res.data.success) {
        toast.success("Food removed");
        fetchList({ keepPage: true });
      } else {
        toast.error("Failed to remove food");
      }
    } catch {
      toast.error("Server error");
    }
  };

  // 🔹 Klik tombol edit
  const handleEditClick = (item) => {
    setEditItem(item._id);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock !== undefined ? item.stock : "",
    });
    setPreviewImage(`${API.defaults.baseURL.replace("/api", "")}/uploads/${item.image}`);
    setEditImage(null);
  };

  // 🔹 Update data makanan
  const handleUpdate = async () => {
    if (
      formData.stock === "" ||
      isNaN(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
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
    } catch {
      toast.error("Server error");
    }
  };

  const formatUSD = (num) =>
    "$" + Number(num).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="table-wrapper">
      <div className="table-card">
        <h2 className="table-title">All Foods List</h2>
        <div className="table-responsive">
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
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    No food data found.
                  </td>
                </tr>
              )}
              {currentFoods.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={`${API.defaults.baseURL.replace("/api", "")}/uploads/${item.image}`}
                      alt={item.name}
                      className="table-img"
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className="price-tag">{formatUSD(item.price)}</span>
                  </td>
                  <td>
                    <span
                      className={`stock-tag ${
                        item.stock === 0 ? "out-of-stock" : ""
                      }`}
                    >
                      {item.stock === 0 ? "Out of stock" : item.stock}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="icon-btn edit"
                      onClick={() => handleEditClick(item)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => removeFood(item._id)}
                      title="Delete"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔹 Pagination */}
        {list.length > FOODS_PER_PAGE && (
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

      {/* 🔹 Modal Edit */}
      {editItem && (
        <div className="edit-modal">
          <div className="edit-box">
            <h3>Edit Food</h3>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <select
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
            <input
              type="number"
              placeholder="Price (USD, e.g. 12.50)"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              step="0.01"
              min="0"
            />
            <input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              min="0"
              step="1"
              className="edit-stock-input"
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              style={{
                background: "#f9faff",
                border: "1.2px solid #ffe5d1",
                marginBottom: 5,
              }}
            />
            <label className="file-label">
              <span>Upload new image</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  setEditImage(e.target.files[0]);
                  setPreviewImage(URL.createObjectURL(e.target.files[0]));
                }}
              />
            </label>
            {previewImage && (
              <img
                src={previewImage}
                alt="preview"
                className="edit-preview-img"
              />
            )}
            <div className="edit-actions">
              <button onClick={handleUpdate}>Update</button>
              <button
                onClick={() => {
                  setEditItem(null);
                  setEditImage(null);
                  setPreviewImage(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
