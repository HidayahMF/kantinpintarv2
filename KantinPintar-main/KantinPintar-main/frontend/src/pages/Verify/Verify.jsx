import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContextProvider";
import axios from "axios";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { url, fetchFoodList } = useContext(StoreContext);
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      setError("No session ID found in URL.");
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }

    const verifyPayment = async () => {
      try {
        const verifyUrl = `${url}/api/order/verify?session_id=${encodeURIComponent(
          sessionId
        )}`;
        console.log("[DEBUG] Verifying payment at:", verifyUrl);

        const { data } = await axios.get(verifyUrl);

        if (data.success) {
          console.log("[DEBUG] Payment verified successfully:", data);
          setStatus("success");

          // Refresh data (misalnya stock makanan)
          await fetchFoodList();

          // Redirect ke halaman orders
          setTimeout(() => navigate("/myorders"), 800);
        } else {
          console.warn("[DEBUG] Verification failed:", data);
          setStatus("failed");
          setError(`Verification failed: ${data.message || "Unknown error"}`);
          setTimeout(() => navigate("/"), 2000);
        }
      } catch (err) {
        console.error("[DEBUG] Error verifying payment:", err);
        setStatus("failed");
        setError(
          `Error verifying payment: ${
            err.response?.data?.message || err.message
          }`
        );
        setTimeout(() => navigate("/"), 2000);
      }
    };

    verifyPayment();
  }, [sessionId, url, fetchFoodList, navigate]);

  return (
    <div className="verify">
      <div className="spinner">
        <div className="spinner-circle"></div>

        {status === "verifying" && (
          <span className="verifying-text">Verifying payment...</span>
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
