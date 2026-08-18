import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import API from "../../api";

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
      } catch (err) {
        setStatus("failed");
        setError("Gagal memverifikasi pembayaran. Silakan coba lagi atau hubungi customer service.");
        schedule(() => navigate("/"), 2000);
      }
    };

    verifyPayment();
    return () => timers.forEach(clearTimeout);
  }, [orderId, initialStatus, navigate]);

  return (
    <div className="verify">
      <div className="spinner">
        <div className="spinner-circle"></div>

        {status === "verifying" && (
          <span className="verifying-text">Verifying payment...</span>
        )}

        {status === "pending" && (
          <span className="verifying-text">
            ⏳ Pembayaran masih menunggu...
          </span>
        )}

        {status === "success" && (
          <span className="success-text">
            ✅ Payment verified! Redirecting...
          </span>
        )}

        {status === "failed" && <span className="error-text">❌ {error}</span>}
      </div>
    </div>
  );
};

export default Verify;
