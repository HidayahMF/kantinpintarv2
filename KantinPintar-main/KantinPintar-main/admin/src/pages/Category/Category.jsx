import React, { useEffect, useState } from "react";
import "./Category.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const Category = ({ url, onFoodAdded }) => {
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  // Fetch kategori dari backend
  useEffect(() => {
    fetchCategories();
  }, []);

  // Preview gambar setiap kali file berubah
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  // Fungsi fetch kategori
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${url}/api/category/list`);
      if (res.data.success) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setData((prev) => ({ ...prev, category: res.data.data[0].name }));
        }
      } else {
        toast.error("Failed to load categories");
      }
    } catch (err) {
      toast.error("Failed to fetch categories");
      console.error("Fetch categories error:", err);
    }
  };

  // Handler submit tambah makanan
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validasi stok
    if (
      data.stock === "" ||
      isNaN(Number(data.stock)) ||
      Number(data.stock) < 0
    ) {
      toast.error("Stock harus diisi dan minimal 0");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("stock", Number(data.stock));
    formData.append("category", data.category);
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        toast.success(response.data.message);

        // Reset form
        setData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: categories.length > 0 ? categories[0].name : "",
        });
        setImage(null);
        setPreview(null);

        if (onFoodAdded) onFoodAdded();
      } else {
        toast.error(response.data.message || "Gagal menambahkan makanan");
      }
    } catch (err) {
      toast.error("Failed to add food");
      console.error("Add food error:", err);
    }
  };

  // Handler input
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="add">
      <form className="add-card" onSubmit={onSubmitHandler} autoComplete="off">
        {/* Upload Gambar */}
        <div className="add-img-upload">
          <p className="add-label">Upload Image</p>
          <label htmlFor="image" className="add-img-label">
            <img
              src={preview || assets.upload_area}
              alt="Upload Preview"
              className="add-img-preview"
            />
            <span className="add-img-hint">
              {preview ? "Change Image" : "Click to upload"}
            </span>
          </label>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            accept="image/*"
            hidden
            required
          />
        </div>

        {/* Input Nama */}
        <div className="add-form-fields">
          <label className="add-label" htmlFor="name">
            Product name
          </label>
          <input
            className="add-input"
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            id="name"
            placeholder="Type here"
            required
          />
        </div>

        {/* Input Deskripsi */}
        <div className="add-form-fields">
          <label className="add-label" htmlFor="description">
            Product description
          </label>
          <textarea
            className="add-textarea"
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            id="description"
            rows="6"
            placeholder="Write content here"
            required
          ></textarea>
        </div>

        {/* Kategori, Harga, dan Stok */}
        <div className="add-category-price-row">
          <div className="add-category">
            <label className="add-label" htmlFor="category">
              Product Category
            </label>
            <select
              className="add-select"
              onChange={onChangeHandler}
              name="category"
              id="category"
              value={data.category}
              required
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="add-price">
            <label className="add-label" htmlFor="price">
              Product price
            </label>
            <input
              className="add-input"
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              id="price"
              placeholder="$20"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="add-stock">
            <label className="add-label" htmlFor="stock">
              Stock
            </label>
            <input
              className="add-input add-stock-input"
              onChange={onChangeHandler}
              value={data.stock}
              type="number"
              name="stock"
              id="stock"
              placeholder="0"
              required
              min="0"
              step="1"
              style={{ background: "#f6f8fc" }}
            />
          </div>
        </div>

        {/* Tombol Submit */}
        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Category;
