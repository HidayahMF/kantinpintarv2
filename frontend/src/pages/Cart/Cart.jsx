import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContextProvider"; 
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets"; 
import { formatRp } from "../../utils/format";

const SHIPPING_FEE = 2000;

const Cart = () => {
  const { cartItems, foodList, removeFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();

  if (!foodList || !cartItems) {
    return <div>Loading...</div>;
  }

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Image</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {foodList.map((item) => {
          const quantity = cartItems[item._id] || 0;

          if (quantity > 0) {
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <div className="cart-item-image-container">
                    {item.image ? (
                      <img
                        src={`${url}${item.image}`}

                        alt={item.name}
                        className="cart-item-image"
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = assets.no_image_icon || "/default-food.png";
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">No Image</div>
                    )}
                  </div>
                  <p>{item.name}</p>
                  <p>{formatRp(item.price)}</p>
                  <p>{quantity}</p>
                  <p>{formatRp(item.price * quantity)}</p>
                  <p
                    onClick={() => removeFromCart(item._id)}
                    className="cross"
                    style={{ cursor: "pointer" }}
                  >
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{formatRp(getTotalCartAmount())}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>
                {getTotalCartAmount() === 0 ? "Rp 0" : formatRp(SHIPPING_FEE)}
              </p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                {getTotalCartAmount() === 0
                  ? "Rp 0"
                  : formatRp(getTotalCartAmount() + SHIPPING_FEE)}
              </b>
            </div>
          </div>
          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have promo code, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
