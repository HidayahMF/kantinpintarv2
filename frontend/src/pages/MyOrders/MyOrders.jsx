import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { StoreContext } from "../../context/StoreContextProvider";
import "./MyOrders.css";
import { formatRp } from "../../utils/format";
import {
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
} from "react-icons/fi";

const ORDERS_PER_PAGE = 5;

const STATUS_MAP = {
  Delivered: { label: "Completed", tone: "badge-success" },
  "Out For Delivery": { label: "Processing", tone: "badge-info" },
  "Food Processing": { label: "Processing", tone: "badge-info" },
  Cancelled: { label: "Cancelled", tone: "badge-neutral" },
  Pending: { label: "Pending", tone: "badge-warning" },
};

const getStatusInfo = (order) => {
  if (order.paymentStatus === "failed")
    return { label: "Failed", tone: "badge-error" };
  if (order.paymentStatus === "pending")
    return { label: "Pending", tone: "badge-warning" };
  return STATUS_MAP[order.status] || { label: order.status || "Pending", tone: "badge-neutral" };
};

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      const res = await API.get("/order/userorders");
      setOrders(res.data.success ? res.data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [token]);

  useEffect(() => {
    setExpandedIdx(null);
  }, [currentPage]);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  if (loading) {
    return (
      <div className="my-orders">
        <h1 className="page-title">My Orders</h1>
        <div className="orders-skeleton">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card orders-skeleton-card">
              <span className="skeleton" style={{ width: 60, height: 60 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="skeleton" style={{ height: 14, width: "60%" }} />
                <span className="skeleton" style={{ height: 12, width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="section-head">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">
            Lacak dan lihat semua pesananmu di satu tempat.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchOrders}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="state-box">
          <div className="state-icon">
            <FiPackage size={24} />
          </div>
          <h3>Belum ada pesanan</h3>
          <p>Kamu belum membuat pesanan apa pun. Yuk, mulai pesan makanan favoritmu!</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/category/All")}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {currentOrders.map((order, index) => {
            const idxOrders = startIndex + index;
            const status = getStatusInfo(order);
            const isExpanded = expandedIdx === idxOrders;
            const orderDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-";

            return (
              <div
                key={order._id || idxOrders}
                className={`order-card card ${isExpanded ? "expanded" : ""}`}
              >
                <button
                  className="order-card-main"
                  onClick={() => setExpandedIdx(isExpanded ? null : idxOrders)}
                  aria-expanded={isExpanded}
                >
                  <div className="order-card-icon">
                    <FiPackage size={20} />
                  </div>
                  <div className="order-card-info">
                    <span className={`badge ${status.tone}`}>{status.label}</span>
                    <span className="order-card-date">{orderDate}</span>
                  </div>
                  <div className="order-card-items">
                    <strong>#{String(order._id || "").slice(-6)}</strong>
                    <span>
                      {order.items.length} item •{" "}
                      {order.items.slice(0, 2).map((i) => i.name).join(", ")}
                      {order.items.length > 2 ? "..." : ""}
                    </span>
                  </div>
                  <div className="order-card-amount">{formatRp(order.amount)}</div>
                  <span className="order-card-chevron">
                    {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="order-details fade-in">
                    <h4>Order Details</h4>
                    <div className="order-details-table">
                      {order.items.map((item, idx) => (
                        <div className="order-details-row" key={idx}>
                          <span className="order-detail-name">{item.name}</span>
                          <span className="order-detail-qty">x{item.quantity}</span>
                          <span className="order-detail-price">{formatRp(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="order-details-row total">
                        <span>Order Total</span>
                        <span />
                        <strong>{formatRp(order.amount)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

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
        </div>
      )}
    </div>
  );
};

export default MyOrders;
