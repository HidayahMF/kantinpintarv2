import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContextProvider";
import { useNavigate, Link } from "react-router-dom";
import { formatRp } from "../../utils/format";
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight } from "react-icons/fi";

const SHIPPING_FEE = 2000;

const Cart = () => {
  const {
    cartItems,
    foodList,
    removeFromCart,
    addToCart,
    getTotalCartAmount,
    url,
  } = useContext(StoreContext);
  const navigate = useNavigate();

  const cartEntries = (foodList || []).filter(
    (item) => (cartItems?.[item._id] || 0) > 0
  );

  const subtotal = getTotalCartAmount();
  const isEmpty = cartEntries.length === 0;

  return (
    <div className="cart-page">
      <div className="section-head">
        <div>
          <h1 className="page-title">Your Cart</h1>
          <p className="page-subtitle">
            {isEmpty ? "Keranjang kamu masih kosong." : `${cartEntries.length} item di keranjangmu`}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="state-box">
          <div className="state-icon">
            <FiShoppingBag size={24} />
          </div>
          <h3>Keranjang masih kosong</h3>
          <p>
            Yuk, cari makanan favoritmu dan tambahkan ke keranjang.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/category/All")}>
            Browse Menu
            <FiArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items list */}
          <div className="cart-items">
            {cartEntries.map((item) => {
              const qty = cartItems[item._id];
              return (
                <div className="cart-item card" key={item._id}>
                  <img
                    src={item.image?.startsWith("http") ? item.image : `${url}${item.image}`}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-food.png";
                    }}
                  />
                  <div className="cart-item-info">
                    <Link to={`/food/${item._id}`} className="cart-item-name">
                      {item.name}
                    </Link>
                    <span className="cart-item-unit">{formatRp(item.price)} / item</span>
                    {item.stock === 0 && (
                      <span className="badge badge-error">Out of stock</span>
                    )}
                  </div>

                  <div className="cart-item-qty">
                    <div className="food-item-counter">
                      <button
                        className="counter-btn"
                        onClick={() => removeFromCart(item._id)}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="counter-qty">{qty}</span>
                      <button
                        className="counter-btn"
                        onClick={() => {
                          if (qty + 1 > (item.stock ?? 0)) return;
                          addToCart(item._id);
                        }}
                        disabled={qty >= (item.stock ?? 0)}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <span className="cart-item-total-label">Total</span>
                    <strong>{formatRp(item.price * qty)}</strong>
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item._id)}
                    aria-label={`Remove ${item.name} from cart`}
                    title="Remove"
                  >
                    <FiTrash2 size={17} />
                  </button>
                </div>
              );
            })}

            <Link to="/category/All" className="cart-continue">
              ← Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="cart-summary">
            <div className="cart-summary-card card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatRp(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{subtotal === 0 ? "Rp 0" : formatRp(SHIPPING_FEE)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>Total</span>
                <strong>{subtotal === 0 ? "Rp 0" : formatRp(subtotal + SHIPPING_FEE)}</strong>
              </div>
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={() => navigate("/order")}
              >
                Proceed to Checkout
                <FiArrowRight size={17} />
              </button>
              <p className="summary-note">
                Pembayaran diproses dengan aman melalui Midtrans.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
