import React, { useState, useEffect } from "react";
import API from "../../api";
import "./Dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrash2 } from "react-icons/fi";

const ROWS_PER_PAGE = 5;

const formatIDR = (num) => {
  const value = Number(num) || 0;
  if (value >= 1000000000)
    return `Rp ${(value / 1000000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (value >= 1000000)
    return `Rp ${(value / 1000000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (value >= 1000)
    return `Rp ${(value / 1000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return "Rp " + value.toLocaleString("id-ID");
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          API.get("/user/users"),
          API.get("/order/list"),
        ]);
        if (usersRes.data.success && Array.isArray(usersRes.data.users)) {
          setUsers(usersRes.data.users);
        }
        if (ordersRes.data.success && Array.isArray(ordersRes.data.orders)) {
          setOrders(ordersRes.data.orders);
          setAllOrders(ordersRes.data.orders);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    generateRevenueChart(allOrders);
  }, [allOrders]);

  const generateRevenueChart = (ordersSource) => {
    const dailyMap = {};
    const monthlyMap = {};

    ordersSource.forEach((order) => {
      if (order.paymentStatus !== "completed") return;
      const dateObj = new Date(order.createdAt);
      const day = dateObj.toISOString().slice(0, 10);
      const month = dateObj.toLocaleString("default", { month: "short", year: "numeric" });

      dailyMap[day] = (dailyMap[day] || 0) + order.amount;
      monthlyMap[month] = (monthlyMap[month] || 0) + order.amount;
    });

    setDailyRevenue(
      Object.entries(dailyMap)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, total]) => ({ date, total }))
    );
    setMonthlyRevenue(
      Object.entries(monthlyMap)
        .sort((a, b) => {
          const [ma, ya] = a[0].split(" ");
          const [mb, yb] = b[0].split(" ");
          return new Date(`${ma} 1, ${ya}`) - new Date(`${mb} 1, ${yb}`);
        })
        .map(([month, total]) => ({ month, total }))
    );
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/user/${deleteTarget}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget));
      toast.success("User deleted successfully.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
    setDeleteTarget(null);
  };

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: FiUsers,
      tone: "green",
    },
    {
      title: "Completed Orders",
      value: allOrders.filter((o) => o.paymentStatus === "completed").length,
      icon: FiShoppingBag,
      tone: "orange",
    },
    {
      title: "Revenue (this month)",
      value: monthlyRevenue.length
        ? formatIDR(monthlyRevenue[monthlyRevenue.length - 1].total)
        : "Rp 0",
      icon: FiDollarSign,
      tone: "lime",
    },
  ];

  const totalUserPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const totalOrderPages = Math.ceil(orders.length / ROWS_PER_PAGE);
  const usersPageData = users.slice((userPage - 1) * ROWS_PER_PAGE, userPage * ROWS_PER_PAGE);
  const ordersPageData = orders.slice((orderPage - 1) * ROWS_PER_PAGE, orderPage * ROWS_PER_PAGE);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* KPI Cards */}
      <div className="dashboard-stats">
        {stats.map((item, idx) => (
          <div key={idx} className={`stat-card card tone-${item.tone}`}>
            <span className="stat-icon">
              <item.icon size={20} />
            </span>
            <div>
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-box card">
          <h3>Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyRevenue} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-faint)" />
              <YAxis width={80} tickFormatter={formatIDR} tick={{ fontSize: 11 }} stroke="var(--color-text-faint)" />
              <Tooltip formatter={(v) => formatIDR(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="total" name="Revenue" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box card">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevenue} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-text-faint)" />
              <YAxis width={80} tickFormatter={formatIDR} tick={{ fontSize: 11 }} stroke="var(--color-text-faint)" />
              <Tooltip formatter={(v) => formatIDR(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total" name="Revenue" fill="var(--color-accent)" barSize={28} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users */}
      <div className="table-card">
        <div className="table-card-header">
          <h2>Recent Users</h2>
          <span className="badge badge-info">{users.length} users</span>
        </div>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date Joined</th>
                <th>Role</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {usersPageData.map((u) => (
                <tr key={u._id}>
                  <td className="user-cell">
                    <span className="user-avatar">{(u.name || "U").charAt(0).toUpperCase()}</span>
                    <strong>{u.name}</strong>
                  </td>
                  <td className="muted-cell">{u.email}</td>
                  <td className="muted-cell">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US") : "-"}
                  </td>
                  <td>
                    <span className={`badge ${u.isAdmin ? "badge-accent" : "badge-neutral"}`}>
                      {u.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {!u.isAdmin && (
                      <button
                        className="icon-btn danger"
                        onClick={() => setDeleteTarget(u._id)}
                        aria-label={`Delete user ${u.name}`}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {usersPageData.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {users.length > ROWS_PER_PAGE && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
              disabled={userPage === 1}
            >
              &larr; Prev
            </button>
            <span className="pagination-info">
              Page <b>{userPage}</b> of <b>{totalUserPages}</b>
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setUserPage((p) => Math.min(p + 1, totalUserPages))}
              disabled={userPage === totalUserPages}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="table-card">
        <div className="table-card-header">
          <h2>Recent Orders</h2>
          <span className="badge badge-neutral">{orders.length} orders</span>
        </div>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersPageData.map((o) => {
                const isCompleted = o.paymentStatus === "completed";
                return (
                  <tr key={o._id}>
                    <td className="mono-cell">#{o._id.slice(-6)}</td>
                    <td>
                      <strong>{o.userId?.name || "-"}</strong>
                      <span className="cell-sub">{o.userId?.email || ""}</span>
                    </td>
                    <td className="amount-cell">{formatIDR(o.amount)}</td>
                    <td>
                      <span className={`badge ${isCompleted ? "badge-success" : "badge-warning"}`}>
                        {isCompleted ? "Completed" : o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {ordersPageData.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {orders.length > ROWS_PER_PAGE && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOrderPage((p) => Math.max(p - 1, 1))}
              disabled={orderPage === 1}
            >
              &larr; Prev
            </button>
            <span className="pagination-info">
              Page <b>{orderPage}</b> of <b>{totalOrderPages}</b>
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOrderPage((p) => Math.min(p + 1, totalOrderPages))}
              disabled={orderPage === totalOrderPages}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this user?"
          message="Tindakan ini tidak dapat dibatalkan."
          confirmText="Delete"
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
