import React, { useEffect, useState } from "react";
import "./Category.css";
import { toast } from "react-toastify";
import API from "../../api";
import { FiUploadCloud } from "react-icons/fi";

const Category = ({ onFoodAdded }) => {
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category/list");
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

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (data.stock === "" || isNaN(Number(data.stock)) || Number(data.stock) < 0) {
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

    setSubmitting(true);
    try {
      const response = await API.post("/food/add", formData);
      if (response.data.success) {
        toast.success(response.data.message);
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
    setSubmitting(false);
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="add-page">
      <form className="add-card card" onSubmit={onSubmitHandler} autoComplete="off">
        <div className="add-img-upload">
          <p className="add-label">Upload Image</p>
          <label htmlFor="image" className="add-img-label">
            {preview ? (
              <img src={preview} alt="Upload Preview" className="add-img-preview" />
            ) : (
              <span className="add-img-placeholder">
                <FiUploadCloud size={28} />
                <span>Click to upload</span>
              </span>
            )}
            <span className="add-img-hint">
              {preview ? "Change Image" : "Upload food image"}
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

        <div className="add-form-fields">
          <div className="form-field">
            <label htmlFor="name">Product name</label>
            <input
              id="name"
              className="input"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              name="name"
              placeholder="Type here"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Product description</label>
            <textarea
              id="description"
              className="textarea"
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="5"
              placeholder="Write content here"
              required
            />
          </div>

          <div className="add-category-price-row">
            <div className="form-field">
              <label htmlFor="category">Product Category</label>
              <select
                id="category"
                className="select"
                onChange={onChangeHandler}
                name="category"
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

            <div className="form-field">
              <label htmlFor="price">Product price</label>
              <input
                id="price"
                className="input"
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="Rp 20000"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                className="input"
                onChange={onChangeHandler}
                value={data.stock}
                type="number"
                name="stock"
                placeholder="0"
                required
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="btn-spinner" />
              Adding...
            </>
          ) : (
            "Add Food"
          )}
        </button>
      </form>
    </div>
  );
};

export default Category;
