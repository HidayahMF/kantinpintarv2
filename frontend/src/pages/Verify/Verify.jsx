import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import API from "../../api";
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const initialStatus = searchParams.get("status");

  const { fetchFoodList } = useContext(StoreContext);
  const navigate = useNavigate();

  const [status, setStatus] = useState(
    initialStatus === "failed"
      ? "failed"
      : initialStatus === "pending"
      ? "pending"
      : "verifying"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let timers = [];
    const schedule = (fn, ms) => {
      const t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    };

    if (!orderId) {
      setStatus("failed");
      setError("No order ID found in URL.");
      schedule(() => navigate("/"), 2000);
      return () => timers.forEach(clearTimeout);
    }

    if (initialStatus === "failed") {
      setError("Pembayaran gagal. Silakan coba lagi.");
      schedule(() => navigate("/"), 2000);
      return () => timers.forEach(clearTimeout);
    }

    const verifyPayment = async () => {
      try {
        const verifyUrl = `/order/verify?order_id=${encodeURIComponent(orderId)}`;
        const { data } = await API.get(verifyUrl);

        if (data.success) {
          setStatus("success");
          await fetchFoodList();
          schedule(() => navigate("/myorder"), 800);
        } else if (data.status === "pending") {
          setStatus("pending");
          setError(data.message || "Payment is still pending.");
          schedule(() => navigate("/myorder"), 2000);
        } else {
          setStatus("failed");
          setError("Pembayaran tidak dapat diverifikasi. Silakan coba lagi.");
          schedule(() => navigate("/"), 2000);
        }
      } catch {
        setStatus("failed");
        setError(
          "Gagal memverifikasi pembayaran. Silakan coba lagi atau hubungi customer service."
        );
        schedule(() => navigate("/"), 2000);
      }
    };

    verifyPayment();
    return () => timers.forEach(clearTimeout);
  }, [orderId, initialStatus, navigate]);

  const config = {
    verifying: {
      icon: <FiLoader size={30} className="verify-icon spin" />,
      tone: "verifying",
      title: "Verifying payment...",
      text: "Kami sedang memverifikasi status pembayaranmu.",
    },
    pending: {
      icon: <FiClock size={30} className="verify-icon" />,
      tone: "pending",
      title: "Payment still pending",
      text: "Pembayaran masih menunggu konfirmasi. Kamu akan diarahkan ke halaman pesanan.",
    },
    success: {
      icon: <FiCheckCircle size={30} className="verify-icon" />,
      tone: "success",
      title: "Payment verified!",
      text: "Pembayaran berhasil. Mengarahkan ke halaman pesanan...",
    },
    failed: {
      icon: <FiXCircle size={30} className="verify-icon" />,
      tone: "failed",
      title: "Payment failed",
      text: error || "Terjadi kesalahan saat memverifikasi pembayaran.",
    },
  }[status];

  return (
    <div className="verify">
      <div className="verify-card card">
        <div className={`verify-icon-wrap ${config.tone}`}>{config.icon}</div>
        <h1>{config.title}</h1>
        <p>{config.text}</p>
        {status === "failed" && (
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default Verify;
