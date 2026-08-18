import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContextProvider";
import { toast } from "react-toastify";
import API from "../../api";
import "./Orders.css";
import { formatRp } from "../../utils/format";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import {
  FiShoppingBag,
  FiTrash2,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";

const ORDERS_PER_PAGE = 5;

const STATUS_OPTIONS = [
  { value: "Food Processing", label: "Food Processing" },
  { value: "Out For Delivery", label: "Out For Delivery" },
  { value: "Delivered", label: "Delivered" },
];

const Orders = () => {
  const { token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
        console.error("Order fetch error:", error.response?.data || error.message);
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
      const res = await API.post(`/order/status`, {
        orderId,
        status: event.target.value,
      });

      if (res.data.success) {
        toast.success("Status updated");
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/order/delete/${deleteTarget}`);
      toast.success("Order deleted!");
      setOrders((prev) => prev.filter((order) => order._id !== deleteTarget));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete order");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = sortedOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  if (!token) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p>Memuat pesanan...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      {orders.length === 0 ? (
        <div className="state-box">
          <div className="state-icon">
            <FiShoppingBag size={24} />
          </div>
          <h3>Belum ada pesanan</h3>
          <p>Pesanan dari pelanggan akan muncul di sini.</p>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {currentOrders.map((order) => {
              const customerName =
                (order.address?.firstName || "") +
                " " +
                (order.address?.lastName || "");
              const isCompleted = order.paymentStatus === "completed";

              return (
                <div key={order._id} className="order-item card">
                  <div className="order-item-main">
                    <div className="order-item-icon">
                      <FiShoppingBag size={18} />
                    </div>
                    <div className="order-item-content">
                      <div className="order-item-top">
                        <strong className="order-id">
                          Order #{String(order._id || "").slice(-6)}
                        </strong>
                        <span className="order-date">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </div>

                      <p className="order-items">
                        {(order.items || []).map((item, idx) => (
                          <span key={idx}>
                            {item.name} x{item.quantity}
                            {idx < order.items.length - 1 && ", "}
                          </span>
                        ))}
                      </p>

                      <div className="order-customer">
                        <span>
                          <FiUser size={13} /> {customerName || "-"}
                        </span>
                        {order.address?.phone && (
                          <span>
                            <FiPhone size={13} /> {order.address.phone}
                          </span>
                        )}
                      </div>

                      {order.address?.street && (
                        <p className="order-address">
                          <FiMapPin size={13} />
                          {order.address.street}, {order.address.city},{" "}
                          {order.address.state}, {order.address.country},{" "}
                          {order.address.zipcode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="order-item-side">
                    <div className="order-totals">
                      <span className="order-qty">{order.items.length} items</span>
                      <strong>{formatRp(order.amount)}</strong>
                    </div>
                    <div className="order-status-block">
                      <span className={`badge ${isCompleted ? "badge-success" : "badge-warning"}`}>
                        {isCompleted ? "Paid" : "Unpaid"}
                      </span>
                      <select
                        onChange={(event) => statusHandler(event, order._id)}
                        value={order.status || "Food Processing"}
                        className="select order-status-select"
                        aria-label="Update order status"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm order-delete-btn"
                      onClick={() => setDeleteTarget(order._id)}
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {orders.length > ORDERS_PER_PAGE && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                &larr; Prev
              </button>
              <span className="pagination-info">
                Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this order?"
          message="Pesanan akan dihapus permanen. Lanjutkan?"
          confirmText="Delete"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Orders;
