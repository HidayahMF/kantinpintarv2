import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContextProvider";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import API from "../../api"; // ✅ gunakan file API.js kamu
import "./Orders.css";
import { formatRp } from "../../utils/format";

const ORDERS_PER_PAGE = 5;

const Orders = () => {
  const { token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

  useEffect(() => {
    if (!token) return;

    const fetchAllOrders = async () => {
      try {
        const res = await API.get(`/order/list`);

        if (res.data.success) {
          setOrders(res.data.orders || []);
        } else {
          toast.error("Failed to fetch orders");
        }
      } catch (error) {
        toast.error("Something went wrong");
        console.error(
          "Order fetch error:",
          error.response?.data || error.message
        );
      }
    };

    fetchAllOrders();
  }, [token]);

  const statusHandler = async (event, orderId) => {
    if (!token) {
      toast.error("No token found, please login");
      return;
    }
    try {
      const res = await API.post(
        `/order/status`,
        { orderId, status: event.target.value }
      );

      if (res.data.success) {
        toast.success("Status updated");

        // Refresh data setelah update
        const res2 = await API.get(`/order/list`);
        if (res2.data.success) {
          setOrders(res2.data.orders || []);
        }
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating status");
      console.error("Update status error", error.response || error);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await API.delete(`/order/delete/${orderId}`);
      toast.success("Order deleted!");
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete order");
    }
  };

  // Urutkan orders terbaru ke terlama
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = sortedOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  if (!token) return <div>Loading orders...</div>;

  return (
    <div className="order add">
      <div className="order-header"></div>
      <div className="order-list">
        {orders.length === 0 && <p>No orders available</p>}
        {currentOrders.map((order) => (
          <div key={order._id} className="order-item">
            <img src={assets.parcel_icon} alt="parcel icon" />
            <div>
              <p className="order-item-food">
                {(order.items || []).map((item, idx) => (
                  <span key={idx}>
                    {item.name} x{item.quantity}
                    {idx < order.items.length - 1 && ", "}
                  </span>
                ))}
              </p>
              <p className="order-item-name">
                {(order.address?.firstName || "") +
                  " " +
                  (order.address?.lastName || "")}
              </p>
              <div className="order-item-address">
                <p>{order.address?.street || ""}</p>
                <p>
                  {(order.address?.city || "") +
                    ", " +
                    (order.address?.state || "") +
                    ", " +
                    (order.address?.country || "") +
                    ", " +
                    (order.address?.zipcode || "")}
                </p>
              </div>
              <p className="order-item-phone">{order.address?.phone || ""}</p>
            </div>
            <div className="order-item-side">
              <p>
                <span className="order-side-label">Items:</span>{" "}
                {order.items.length}
              </p>
              <p>
                <span className="order-side-label">Total:</span>{" "}
                <span className="order-amount">
                  {formatRp(order.amount)}
                </span>
              </p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status || "Food Processing"}
                className="order-status-select"
                style={{
                  marginBottom: order.status === "Delivered" ? "10px" : 0,
                }}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>

              <button
                className="delete-order-btn"
                onClick={() => handleDelete(order._id)}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}

        {orders.length > ORDERS_PER_PAGE && (
          <div
            className="pagination-controls"
            style={{ textAlign: "center", margin: "20px 0" }}
          >
            <button
              className="icon-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ marginRight: 8, opacity: currentPage === 1 ? 0.5 : 1 }}
              title="Previous"
            >
              ⬅️
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="icon-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                marginLeft: 8,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
              title="Next"
            >
              ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
