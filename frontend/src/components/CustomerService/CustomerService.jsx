import React, { useState, useContext, useEffect } from "react";
import "./CustomerService.css";
import { StoreContext } from "../../context/StoreContextProvider";
import CustomerServiceRoom from "../CustomerServiceRoom/CustomerServiceRoom";
import API from "../../api";
import {
  FiChevronDown,
  FiMessageCircle,
  FiMail,
  FiPhone,
  FiClock,
  FiSend,
} from "react-icons/fi";

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
  const { token, user } = useContext(StoreContext);
  const [expand, setExpand] = useState(-1);
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
      await API.post("/message", form);
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
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowRoom(false)}
        >
          ← Back
        </button>
        <CustomerServiceRoom />
      </div>
    );
  }

  return (
    <div className="cs-container">
      <div className="cs-hero card">
        <span className="cs-hero-icon">
          <FiMessageCircle size={26} />
        </span>
        <h1 className="page-title">Customer Service</h1>
        <p className="page-subtitle">
          Have questions, issues, or need help? Our team is ready to help!
        </p>
      </div>

      <section className="cs-section">
        <div className="section-head">
          <div>
            <h2>FAQ</h2>
            <p>Frequently asked questions</p>
          </div>
        </div>
        <div className="cs-faq">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className={`cs-faq-item card ${expand === idx ? "active" : ""}`}
              onClick={() => setExpand(expand === idx ? -1 : idx)}
              tabIndex={0}
              role="button"
              aria-expanded={expand === idx}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpand(expand === idx ? -1 : idx);
                }
              }}
            >
              <div className="cs-faq-q">
                {item.q}
                <FiChevronDown
                  size={18}
                  className={expand === idx ? "rotated" : ""}
                />
              </div>
              {expand === idx && (
                <div className="cs-faq-a fade-in">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="cs-section">
        <div className="section-head">
          <div>
            <h2>Contact Us</h2>
            <p>Hubungi kami melalui saluran berikut</p>
          </div>
        </div>
        <div className="cs-contact-grid">
          <div className="cs-contact-item card">
            <span className="cs-contact-icon">
              <FiMail size={17} />
            </span>
            <div>
              <label>Email</label>
              <p>support@kantingo.com</p>
            </div>
          </div>
          <div className="cs-contact-item card">
            <span className="cs-contact-icon">
              <FiPhone size={17} />
            </span>
            <div>
              <label>WhatsApp</label>
              <p>+62-8212-5630-770</p>
            </div>
          </div>
          <div className="cs-contact-item card">
            <span className="cs-contact-icon">
              <FiClock size={17} />
            </span>
            <div>
              <label>Jam Operasional</label>
              <p>09.00 - 21.00 WIB (Senin - Minggu)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cs-section">
        <div className="section-head">
          <div>
            <h2>Send Direct Message</h2>
            <p>Kirim pesan langsung ke tim kami</p>
          </div>
        </div>
        <form className="cs-form card" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="cs-name">Nama</label>
              <input
                id="cs-name"
                className="input"
                type="text"
                name="name"
                placeholder="Nama Anda"
                required
                value={form.name}
                onChange={handleChange}
                disabled={loading || !!user?.name}
                autoComplete="name"
              />
            </div>
            <div className="form-field">
              <label htmlFor="cs-email">Email</label>
              <input
                id="cs-email"
                className="input"
                type="email"
                name="email"
                placeholder="Email aktif"
                required
                value={form.email}
                onChange={handleChange}
                disabled={loading || !!user?.email}
                autoComplete="email"
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="cs-message">Pesan</label>
            <textarea
              id="cs-message"
              className="textarea"
              name="message"
              placeholder="Tulis pesan Anda..."
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          {sent && (
            <p className="cs-success">
              Thank you, your message has been sent!
            </p>
          )}
          <div>
            <button type="submit" className="btn btn-primary" disabled={sent || loading}>
              <FiSend size={15} />
              {loading ? "Mengirim..." : sent ? "Pesan Terkirim!" : "Kirim Pesan"}
            </button>
          </div>
        </form>
      </section>

      <section className="cs-section cs-chat-section">
        <div className="cs-chat-card card">
          <div>
            <h3>Chat with Admin</h3>
            <p>Real-time chat langsung dengan admin KantinGo.</p>
          </div>
          <button className="btn btn-accent btn-lg" onClick={() => setShowRoom(true)}>
            <FiMessageCircle size={17} />
            Enter Chat Room
          </button>
        </div>
      </section>
    </div>
  );
};

export default CustomerService;
