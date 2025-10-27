import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/StoreContextProvider";
import ErrorBoundary from "./ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <StoreContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StoreContextProvider>
    </ErrorBoundary>
  </StrictMode>
);
