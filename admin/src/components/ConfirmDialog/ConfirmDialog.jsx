import React, { useEffect } from "react";
import "./ConfirmDialog.css";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const ConfirmDialog = ({ title = "Are you sure?", message = "", confirmText = "Delete", onConfirm, onCancel, busy = false }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="confirm-close" onClick={onCancel} aria-label="Close">
          <FiX size={18} />
        </button>
        <span className="confirm-icon">
          <FiAlertTriangle size={24} />
        </span>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
