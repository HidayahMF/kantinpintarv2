import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContextProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatRp } from "../../utils/format";
import { FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";

const FoodItem = ({ id, name, price, description, image, stock, category }) => {
  const { cartItems, addToCart, removeFromCart, foodList, url } =
    useContext(StoreContext);
  const navigate = useNavigate();
  const quantityInCart = cartItems[id] || 0;

  const foodStock =
    typeof stock !== "undefined"
      ? stock
      : (foodList.find((item) => item._id === id) || {}).stock || 0;

  const handleAddToCart = () => {
    if (quantityInCart + 1 > foodStock) {
      toast.error("Stock tidak cukup!");
      return;
    }
    addToCart(id);
  };

  const goToDetail = () => navigate(`/food/${id}`);

  return (
    <article className="food-item card">
      <div className="food-item-img-wrap" onClick={goToDetail}>
        <img
          className="food-item-image"
          src={image?.startsWith("http") ? image : `${url}${image}`}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = assets.no_image_icon || "/default-food.png";
          }}
        />
        <span
          className={`food-item-stock-badge ${
            foodStock === 0 ? "stock-out" : ""
          }`}
        >
          {foodStock === 0 ? "Out of stock" : `Stock: ${foodStock}`}
        </span>
      </div>

      <div className="food-item-body">
        {category && <span className="food-item-category">{category}</span>}
        <h3 className="food-item-name" onClick={goToDetail}>
          {name}
        </h3>
        <p className="food-item-desc">{description}</p>

        <div className="food-item-footer">
          <div className="food-item-price">
            <span className="food-item-price-label">Harga</span>
            <strong>{formatRp(price)}</strong>
          </div>

          <div className="food-item-cart-action">
            {foodStock === 0 ? (
              <button className="btn btn-ghost btn-sm" disabled>
                Sold Out
              </button>
            ) : !quantityInCart ? (
              <button
                className="btn btn-primary btn-sm food-item-add"
                onClick={handleAddToCart}
                aria-label={`Add ${name} to cart`}
              >
                <FiShoppingBag size={15} />
                Add
              </button>
            ) : (
              <div className="food-item-counter">
                <button
                  className="counter-btn"
                  onClick={() => removeFromCart(id)}
                  aria-label={`Decrease ${name} quantity`}
                >
                  <FiMinus size={14} />
                </button>
                <span className="counter-qty">{quantityInCart}</span>
                <button
                  className="counter-btn"
                  onClick={handleAddToCart}
                  disabled={quantityInCart >= foodStock}
                  aria-label={`Increase ${name} quantity`}
                >
                  <FiPlus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default FoodItem;
