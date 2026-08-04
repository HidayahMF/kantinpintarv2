import React from "react";

const LoadingScreen = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        zIndex: 9999,
      }}
    >
      <div>
        <h2 style={{ color: "#333" }}>Memuat...</h2>
        <p style={{ color: "#666" }}>Mohon tunggu sebentar</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
