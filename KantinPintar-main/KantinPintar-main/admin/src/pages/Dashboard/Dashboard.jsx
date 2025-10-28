import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";

const BACKEND_URL = "http://localhost:4000";
const ROWS_PER_PAGE = 5;

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  // ambil data users & orders
  useEffect(() => {
    const token = localStorage.getItem("token");

    // GET all users
    axios.get(`${BACKEND_URL}/api/user/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data.success && Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        }
      })
      .catch(console.error);

    // GET all orders
    axios.get(`${BACKEND_URL}/api/order/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data.success && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
          setAllOrders(res.data.orders);
        }
      })
      .catch(console.error);
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

    setDailyRevenue(Object.entries(dailyMap).sort((a,b)=> new Date(a[0])-new Date(b[0])).map(([date,total]) => ({date,total})));
    setMonthlyRevenue(Object.entries(monthlyMap).sort((a,b)=>{
      const [ma, ya]=a[0].split(" "); const [mb, yb]=b[0].split(" ");
      return new Date(`${ma} 1, ${ya}`)-new Date(`${mb} 1, ${yb}`);
    }).map(([month,total])=>({month,total})));
  };

  const removeOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o._id !== orderId));
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BACKEND_URL}/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u._id !== userId));
      alert("User deleted successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const formatUSD = (num) => {
    num = Number(num) || 0;
    if (num >= 1000) return `$${(num/1000).toFixed(1)}k`;
    return `$${num.toLocaleString("en-US",{minimumFractionDigits:2})}`;
  };

  const stats = [
    { title: "Total Users", value: users.length },
    { title: "Total Orders", value: allOrders.filter(o=>o.paymentStatus==="completed").length },
    { title: "Total Revenue (this month)", value: monthlyRevenue.length ? "$"+monthlyRevenue[monthlyRevenue.length-1].total.toLocaleString("en-US",{minimumFractionDigits:2}) : "$0.00" },
  ];

  const totalUserPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const totalOrderPages = Math.ceil(orders.length / ROWS_PER_PAGE);
  const usersPageData = users.slice((userPage-1)*ROWS_PER_PAGE,userPage*ROWS_PER_PAGE);
  const ordersPageData = orders.slice((orderPage-1)*ROWS_PER_PAGE,orderPage*ROWS_PER_PAGE);

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Stats */}
      <div className="dashboard-stats">
        {stats.map((item, idx)=>(
          <div key={idx} className="dashboard-stat-card">
            <h2>{item.value}</h2>
            <p>{item.title}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="dashboard-chart-box">
          <h3>Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyRevenue} margin={{top:20,right:20,left:60,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="date"/>
              <YAxis width={75} tickFormatter={v=>v>=1000 ? `$${(v/1000).toFixed(1)}k`:`$${Number(v).toLocaleString("en-US",{minimumFractionDigits:2})}`}/>
              <Tooltip formatter={v=>formatUSD(v)}/>
              <Legend/>
              <Line type="monotone" dataKey="total" stroke="#ff6834" strokeWidth={3}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-chart-box">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} margin={{top:20,right:20,left:60,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis width={75} tickFormatter={v=>v>=1000 ? `$${(v/1000).toFixed(1)}k`:`$${Number(v).toLocaleString("en-US",{minimumFractionDigits:2})}`}/>
              <Tooltip formatter={v=>formatUSD(v)}/>
              <Legend/>
              <Bar dataKey="total" fill="#ff6834" barSize={32}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users */}
      <div className="dashboard-section">
        <h2>Recent Users</h2>
        <table className="dashboard-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Date Joined</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {usersPageData.map(u=>(
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US") : "-"}</td>
                <td>{u.isAdmin ? "Admin":"User"}</td>
                <td>{!u.isAdmin && <button className="icon-btn delete" onClick={()=>handleDeleteUser(u._id)}>❌</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-section">
        <h2>Recent Orders</h2>
        <table className="dashboard-table">
          <thead>
            <tr><th>Order ID</th><th>User</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ordersPageData.map(o=>(
              <tr key={o._id}>
                <td>#{o._id.slice(-4)}</td>
                <td>{o.userId?.name || "-"}<br/><small>{o.userId?.email || "-"}</small></td>
                <td>{formatUSD(o.amount)}</td>
                <td>{o.paymentStatus==="completed" ? "Completed" : o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
