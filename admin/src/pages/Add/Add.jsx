import React, { useContext, useEffect, useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import API from "../../api";
import { StoreContext } from "../../context/StoreContextProvider";

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

const Add = ({ url, onAddSuccess }) => {
  const { token } = useContext(StoreContext);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  useEffect(() => {
    if (menu_list.length > 0 && !data.category) {
      setData((prev) => ({ ...prev, category: menu_list[0].menu_name }));
    }
  }, [data.category]);

  useEffect(() => {
    if (image) {
      setPreview(URL.createObjectURL(image));
      return () => URL.revokeObjectURL(preview);
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

    try {
       const res = await API.post("/food/add", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="add">
      <form className="add-card" onSubmit={onSubmitHandler} autoComplete="off">
        <div className="add-img-upload">
          <p className="add-label">Upload Image</p>
          <label htmlFor="image" className="add-img-label">
            <img
              src={preview ? preview : assets.upload_area}
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

        <div className="add-form-fields">
          <label className="add-label">Product name</label>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
            className="add-input"
            required
          />

          <label className="add-label">Product description</label>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="5"
            placeholder="Write content here"
            className="add-textarea"
            required
          ></textarea>

          <div className="add-category-price-row">
            <div className="add-category">
              <label className="add-label">Product Type</label>
              <select
                onChange={onChangeHandler}
                name="category"
                value={data.category}
                className="add-select"
                required
              >
                {menu_list.map((menu) => (
                  <option key={menu.menu_name} value={menu.menu_name}>
                    {menu.menu_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="add-price">
              <label className="add-label">Product price</label>
              <input
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="Rp 20000"
                className="add-input"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="add-stock">
              <label className="add-label">Stock</label>
              <input
                onChange={onChangeHandler}
                value={data.stock}
                type="number"
                name="stock"
                placeholder="0"
                className="add-input add-stock-input"
                required
                min="0"
                step="1"
                style={{ background: "#f6f8fc" }}
              />
            </div>
          </div>
        </div>
        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;
