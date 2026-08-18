import React, { useEffect, useState, useRef } from "react";
import "./Add.css";
import { toast } from "react-toastify";
import API from "../../api";
import { FiUploadCloud } from "react-icons/fi";

const menu_list = [
  { menu_name: "Salad" },
  { menu_name: "Rolls" },
  { menu_name: "Deserts" },
  { menu_name: "Sandwich" },
  { menu_name: "Cake" },
  { menu_name: "Pure Veg" },
  { menu_name: "Pasta" },
  { menu_name: "Noodles" },
];

const Add = ({ onAddSuccess }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const previewUrlRef = useRef(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (menu_list.length > 0 && !data.category) {
      setData((prev) => ({ ...prev, category: menu_list[0].menu_name }));
    }
  }, [data.category]);

  useEffect(() => {
    if (image) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const url = URL.createObjectURL(image);
      previewUrlRef.current = url;
      setPreview(url);
      return () => {
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      };
    } else {
      setPreview(null);
    }
  }, [image]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (data.stock === "" || isNaN(Number(data.stock)) || Number(data.stock) < 0) {
      toast.error("Stock harus diisi (minimal 0)");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("description", data.description.trim());
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("stock", Number(data.stock));
    formData.append("image", image);

    setSubmitting(true);
    try {
      const res = await API.post("/food/add", formData);
      const result = res.data;

      if (result.success) {
        toast.success(result.message || "Product added successfully");
        setData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: menu_list[0].menu_name,
        });
        setImage(null);
        setPreview(null);
        if (onAddSuccess) onAddSuccess();
      } else {
        toast.error(result.message || "Failed to add product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit data");
    }
    setSubmitting(false);
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
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
            <label htmlFor="add-name">Product name</label>
            <input
              id="add-name"
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              name="name"
              placeholder="Type here"
              className="input"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="add-desc">Product description</label>
            <textarea
              id="add-desc"
              onChange={onChangeHandler}
              value={data.description}
              name="description"
              rows="5"
              placeholder="Write content here"
              className="textarea"
              required
            />
          </div>

          <div className="add-category-price-row">
            <div className="form-field">
              <label htmlFor="add-category">Product Type</label>
              <select
                id="add-category"
                onChange={onChangeHandler}
                name="category"
                value={data.category}
                className="select"
                required
              >
                {menu_list.map((menu) => (
                  <option key={menu.menu_name} value={menu.menu_name}>
                    {menu.menu_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="add-price">Product price</label>
              <input
                id="add-price"
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="Rp 20000"
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-field">
              <label htmlFor="add-stock">Stock</label>
              <input
                id="add-stock"
                onChange={onChangeHandler}
                value={data.stock}
                type="number"
                name="stock"
                placeholder="0"
                className="input"
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

export default Add;
