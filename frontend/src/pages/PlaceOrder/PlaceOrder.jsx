import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContextProvider";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { formatRp } from "../../utils/format";
import { toast } from "react-toastify";

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

    // Ambil item yang ada di cart
    const orderItems = foodList
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
    try {
      const res = await API.post("/order/place", orderData);

      if (res.data.success) {
        // Bersihkan cart
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
  };

  if (!cartItems || !foodList) return <div>Loading...</div>;

  return (
    <form onSubmit={placeOrder} className="place-order">
      {/* ----------------- LEFT FORM ----------------- */}
      <div className="place-order-left">
        <p className="title">Shipping Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            placeholder="Last name"
          />
        </div>

        <input
          required
          name="email"
          type="email"
          value={data.email}
          onChange={onChangeHandler}
          placeholder="Email"
        />
        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          placeholder="Street Address"
        />

        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            placeholder="City"
          />
          <input
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            placeholder="Province"
          />
        </div>

        <div className="multi-fields">
          <input
            required
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            placeholder="Postal Code"
          />
          <input
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            placeholder="Country"
          />
        </div>

        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          placeholder="Phone number"
        />
      </div>

      {/* ----------------- RIGHT SUMMARY ----------------- */}
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>

          {foodList
            .filter((item) => cartItems[item._id] > 0)
            .map((item) => (
              <div key={item._id} className="cart-item-details">
                <div>
                  <p>{item.name}</p>
                  <p>Qty {cartItems[item._id]}</p>
                </div>
                <div>
                  <p>{formatRp(item.price * cartItems[item._id])}</p>
                  <p className="price-each">{formatRp(item.price)} each</p>
                </div>
              </div>
            ))}

          <hr />

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>{formatRp(getTotalCartAmount())}</p>
          </div>
          <div className="cart-total-details">
            <p>Shipping Costs</p>
            <p>{getTotalCartAmount() === 0 ? "Rp 0" : formatRp(SHIPPING_FEE)}</p>
          </div>
          <div className="cart-total-details total">
            <b>Total</b>
            <b>
              {getTotalCartAmount() === 0
                ? "Rp 0"
                : formatRp(getTotalCartAmount() + SHIPPING_FEE)}
            </b>
          </div>

          <button type="submit" className="place-order-btn">
            Proceed to Payment
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
