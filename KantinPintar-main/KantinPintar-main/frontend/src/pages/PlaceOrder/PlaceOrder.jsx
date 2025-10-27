import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContextProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, foodList, cartItems, url, setCartItems } =
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
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart", { replace: true });
    }
  }, [token, getTotalCartAmount, navigate]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login first.");
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
      alert("Your cart is empty.");
      return;
    }

    const totalAmount = getTotalCartAmount();
    const orderData = {
      address: data,
      items: orderItems,
      amount: totalAmount + 2, // shipping fee $2
    };

    try {
      const res = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // Bersihkan cart
        setCartItems({});
        localStorage.removeItem("cartItems");

        if (res.data.session_url) {
          window.location.href = res.data.session_url; // Stripe checkout
        } else {
          alert("Order successfully created!");
          navigate("/myorders");
        }
      } else {
        alert("Failed to process order.");
      }
    } catch (err) {
      console.error("Order Error:", err);
      alert(
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
                  <p>${(item.price * cartItems[item._id]).toFixed(2)}</p>
                  <p className="price-each">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}

          <hr />

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotalCartAmount().toFixed(2)}</p>
          </div>
          <div className="cart-total-details">
            <p>Shipping Costs</p>
            <p>${getTotalCartAmount() === 0 ? "0.00" : "2.00"}</p>
          </div>
          <div className="cart-total-details total">
            <b>Total</b>
            <b>
              $
              {getTotalCartAmount() === 0
                ? "0.00"
                : (getTotalCartAmount() + 2).toFixed(2)}
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
