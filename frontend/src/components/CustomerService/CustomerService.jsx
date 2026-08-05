import React, { useState, useContext, useEffect } from "react";
import "./CustomerService.css";
import { StoreContext } from "../../context/StoreContextProvider";
import CustomerServiceRoom from "../CustomerServiceRoom/CustomerServiceRoom";
import API from "../../api";

const faqs = [
  {
    q: "Bagaimana cara memesan makanan?",
    a: "Pilih makanan, tambahkan ke keranjang, lalu lakukan checkout. Ikuti instruksi pembayaran hingga selesai.",
  },
  {
    q: "Bagaimana jika pesanan saya belum sampai?",
    a: "Silakan cek status pesanan di menu 'My Orders'. Jika ada masalah, hubungi customer service kami melalui form di bawah.",
  },
  {
    q: "Bagaimana mengubah/membatalkan pesanan?",
    a: "Jika pesanan belum diproses, Anda dapat menghubungi customer service kami segera melalui form di bawah atau email.",
  },
];

const CustomerService = () => {
  const { token, user } = useContext(StoreContext);  const [expand, setExpand] = useState(-1);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showRoom, setShowRoom] = useState(false);

  useEffect(() => {
    if (user && user.name && user.email) {
      setForm((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!form.name || !form.email || !form.message) {
      setError("Mohon lengkapi semua field.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Email tidak valid.");
      return;
    }

    if (!token) {
      setError("Silakan login terlebih dahulu untuk mengirim pesan.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/message", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSent(true);
      setForm({ ...form, message: "" });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Gagal mengirim pesan. Silakan coba lagi."
      );
    }
    setLoading(false);
  };

  if (showRoom) {
    return (
      <div className="cs-container">
        <button className="cs-room-back-btn" onClick={() => setShowRoom(false)}>
          ← Back
        </button>
        <CustomerServiceRoom />
      </div>
    );
  }

  return (
    <div className="cs-container">
      <div className="cs-hero">
        <h1>Customer Service</h1>
        <p>Have questions, issues, or need help? Our team is ready to help!</p>
      </div>

      <div className="cs-section">
        <h2>FAQ (Frequently Asked Questions)</h2>
        <div className="cs-faq">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className={`cs-faq-item ${expand === idx ? "active" : ""}`}
              onClick={() => setExpand(expand === idx ? -1 : idx)}
              tabIndex={0}
              role="button"
            >
              <div className="cs-faq-q">
                {item.q}
                <span>{expand === idx ? "▲" : "▼"}</span>
              </div>
              {expand === idx && <div className="cs-faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="cs-section cs-contact-info">
        <h2>Contact Us</h2>
        <ul>
          <li>
            <b>Email:</b> support@kantingo.com
          </li>
          <li>
            <b>WhatsApp:</b> +62-8212-5630-770
          </li>
          <li>
            <b>Jam Operasional:</b> 09.00 - 21.00 WIB (Senin - Minggu)
          </li>
        </ul>
      </div>

      <div className="cs-section">
        <h2>Send Direct Message</h2>
        <form className="cs-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nama Anda"
            required
            value={form.name}
            onChange={handleChange}
            disabled={loading || !!user?.name}
            autoComplete="name"
          />
          <input
            type="email"
            name="email"
            placeholder="Email aktif"
            required
            value={form.email}
            onChange={handleChange}
            disabled={loading || !!user?.email}
            autoComplete="email"
          />
          <textarea
            name="message"
            placeholder="Tulis pesan Anda..."
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
            disabled={loading}
          />
          <button type="submit" disabled={sent || loading}>
            {loading ? "Mengirim..." : sent ? "Pesan Terkirim!" : "Kirim Pesan"}
          </button>
          {error && <p className="cs-error">{error}</p>}
          {sent && (
            <p className="cs-success">Thank you, your message has been sent!</p>
          )}
        </form>
      </div>

      <div className="cs-section" style={{ textAlign: "center" }}>
        <button className="cs-roomchat-btn" onClick={() => setShowRoom(true)}>
          💬 Enter Chat Room with Admin
        </button>
        <div style={{ marginTop: 7, fontSize: ".97rem", color: "#555" }}>
          Can send real-time chat with admin.
        </div>
      </div>
    </div>
  );
};

export default CustomerService;
