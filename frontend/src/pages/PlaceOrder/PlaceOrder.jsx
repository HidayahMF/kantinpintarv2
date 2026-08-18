import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContextProvider";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { formatRp } from "../../utils/format";
import { toast } from "react-toastify";
import { FiCreditCard, FiLock, FiArrowRight } from "react-icons/fi";

const SHIPPING_FEE = 2000;

const PlaceOrder = () => {
  const { getTotalCartAmount, token, foodList, cartItems, setCartItems } =
    useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });
  const [placing, setPlacing] = useState(false);

  const navigate = useNavigate();

  // Redirect jika belum login atau cart kosong
  useEffect(() => {
    const total = Object.entries(cartItems || {}).reduce((sum, [id, qty]) => {
      const item = foodList?.find((f) => f._id === id);
      return item ? sum + item.price * qty : sum;
    }, 0);
    if (!token || total === 0) {
      navigate("/cart", { replace: true });
    }
  }, [token, cartItems, foodList, navigate]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.warning("Please login first.");
      return;
    }

    const orderItems =
      foodList
        ?.filter((item) => cartItems[item._id] > 0)
        .map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: cartItems[item._id],
          image: item.image,
          category: item.category,
        })) || [];

    if (orderItems.length === 0) {
      toast.warning("Your cart is empty.");
      return;
    }

    const orderData = {
      address: data,
      items: orderItems,
    };

    setPlacing(true);
    try {
      const res = await API.post("/order/place", orderData);

      if (res.data.success) {
        setCartItems({});
        localStorage.removeItem("cartItems");

        const { snap_token, redirect_url, order_id } = res.data;

        if (window.snap && snap_token) {
          window.snap.pay(snap_token, {
            onSuccess: () => {
              window.location.href = `/verify?order_id=${order_id}`;
            },
            onPending: () => {
              toast.info(
                "Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda."
              );
              window.location.href = `/verify?order_id=${order_id}&status=pending`;
            },
            onError: () => {
              toast.error("Pembayaran gagal. Silakan coba lagi.");
              window.location.href = `/verify?order_id=${order_id}&status=failed`;
            },
            onClose: () => {
              toast.info(
                "Anda menutup pembayaran. Pesanan tetap dibuat, silakan selesaikan pembayaran lewat halaman pesanan."
              );
              navigate("/myorder");
            },
          });
        } else if (redirect_url) {
          window.location.href = redirect_url;
        } else {
          toast.success("Order successfully created!");
          navigate("/myorder");
        }
      } else {
        toast.error("Failed to process order.");
      }
    } catch (err) {
      console.error("Order Error:", err);
      toast.error(
        err?.response?.data?.message ||
          "An error occurred while processing the order."
      );
    }
    setPlacing(false);
  };

  if (!cartItems || !foodList) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Memuat data...</p>
      </div>
    );
  }

  const orderItems = foodList.filter((item) => cartItems[item._id] > 0);
  const subtotal = getTotalCartAmount();

  const field = (name, label, type = "text", placeholder, extra = {}) => (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        className="input"
        required
        name={name}
        type={type}
        value={data[name]}
        onChange={onChangeHandler}
        placeholder={placeholder}
        {...extra}
      />
    </div>
  );

  return (
    <form onSubmit={placeOrder} className="place-order">
      {/* LEFT — shipping information */}
      <div className="place-order-left">
        <div className="section-head">
          <div>
            <h2>Shipping Information</h2>
            <p>Lengkapi data pengiriman pesananmu di bawah ini.</p>
          </div>
        </div>

        <div className="checkout-form card">
          <div className="form-row">
            {field("firstName", "First name", "text", "First name")}
            {field("lastName", "Last name", "text", "Last name")}
          </div>
          {field("email", "Email", "email", "you@example.com")}
          {field("street", "Street Address", "text", "Street address")}
          <div className="form-row">
            {field("city", "City", "text", "City")}
            {field("state", "Province", "text", "Province")}
          </div>
          <div className="form-row">
            {field("zipcode", "Postal Code", "text", "Postal code")}
            {field("country", "Country", "text", "Country", { required: false })}
          </div>
          {field("phone", "Phone number", "tel", "Phone number")}
        </div>
      </div>

      {/* RIGHT — order summary */}
      <div className="place-order-right">
        <div className="cart-summary-card card">
          <h2>Order Summary</h2>

          <div className="summary-items">
            {orderItems.map((item) => (
              <div key={item._id} className="summary-item">
                <div className="summary-item-name">
                  <span>{item.name}</span>
                  <em>Qty {cartItems[item._id]}</em>
                </div>
                <strong>{formatRp(item.price * cartItems[item._id])}</strong>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatRp(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping Costs</span>
            <span>{subtotal === 0 ? "Rp 0" : formatRp(SHIPPING_FEE)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row total">
            <span>Total</span>
            <strong>
              {subtotal === 0 ? "Rp 0" : formatRp(subtotal + SHIPPING_FEE)}
            </strong>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={placing}
          >
            {placing ? (
              <>
                <span className="btn-spinner" />
                Processing...
              </>
            ) : (
              <>
                Place Order
                <FiArrowRight size={17} />
              </>
            )}
          </button>

          <div className="payment-trust">
            <span>
              <FiCreditCard size={14} /> Secure payment via Midtrans
            </span>
            <span>
              <FiLock size={14} /> Your data is protected
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
