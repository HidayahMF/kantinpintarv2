import React, { createContext, useEffect, useState } from "react";
import API from "../api";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [foodList, setFoodList] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    const tokenLocal = localStorage.getItem("token");
    if (tokenLocal) return {};
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : {};
  });

 const url = import.meta.env.VITE_API_URL || "http://localhost:4000";


  // Ambil token dari localStorage/URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const isAdminFromUrl = params.get("isAdmin");
    let t = "";
    let a = false;
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      t = tokenFromUrl;
    } else {
      t = localStorage.getItem("token") || "";
    }
    if (isAdminFromUrl) {
      localStorage.setItem("isAdmin", isAdminFromUrl);
      a = isAdminFromUrl === "true";
    } else {
      a = localStorage.getItem("isAdmin") === "true";
    }
    setToken(t);
    setIsAdmin(a);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  }, [token, isAdmin, initialized]);

  useEffect(() => {
    if (!initialized || !token) {
      setUser(null);
      return;
    }
    const fetchUserInfo = async () => {
      try {
         const res = await API.get('/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setIsAdmin(data.user?.isAdmin === true);
          localStorage.setItem(
            "isAdmin",
            data.user?.isAdmin === true ? "true" : "false"
          );
          setUser(data.user);
        } else {
          setIsAdmin(false);
          setUser(null);
          localStorage.setItem("isAdmin", "false");
        }
      } catch {
        setIsAdmin(false);
        setUser(null);
        localStorage.setItem("isAdmin", "false");
      }
    };
    fetchUserInfo();
  }, [token, url, initialized]);

  // ============ FETCH FOODLIST =============
  const fetchFoodList = async () => {
    try {
       const res = await API.get('/food/list');
       
      const data = await res.json();
      if (data.success) setFoodList(data.data);
      else setFoodList([]);
    } catch {
      setFoodList([]);
    }
  };

  useEffect(() => {
    if (!initialized) return;
    fetchFoodList();
    if (token) {
      loadCartData(token);
      fetchOrders();
    }
  }, [token, initialized]);

  // CART
  useEffect(() => {
    if (!token) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  // -------- CART LOGIC ----------
  const addToCart = async (itemId) => {
    const item = foodList.find((f) => f._id === itemId);
    const currentQty = cartItems[itemId] || 0;
    const stock = item?.stock ?? 0;
    if (currentQty + 1 > stock) {
      // toast.error("Stock tidak cukup!");
      return;
    }
    setCartItems((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
    }));
    if (token) {
      try {
         const res = await API.post("/cart/add",{itemId}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;
      const updatedCart = { ...prev, [itemId]: prev[itemId] - 1 };
      if (updatedCart[itemId] <= 0) delete updatedCart[itemId];
      return updatedCart;
    });
    if (token) {
      try {
         const res = await API.post("/cart/remove",{itemId}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  };

  // ---------- ORDER ----------
  const fetchOrders = async () => {
    if (!token) {
      setOrders([]);
      return;
    }
    try {
       const res = await API.get("/order/userorders", {
          headers: { Authorization: `Bearer ${token}` },
        });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }
  };

  const loadCartData = async (token) => {
    try {
       const res = await API.get("/cart/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
      const data = await res.json();
      setCartItems(data.cartData || {});
    } catch {
      setCartItems({});
    }
  };

  const reloadAll = async () => {
    await fetchFoodList();
    if (token) {
      await loadCartData(token);
      await fetchOrders();
    }
  };

  // Refresh food after order/verify
  const refreshFoodAfterOrder = async () => {
    await fetchFoodList();
  };

  const addReview = async (foodId, review) => {
    try {
       const res = await API.post("/food/review",{
        foodId,
        rating: review.rating,
        comment: review.comment,
       }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      const data = await res.json();
      if (data.success && data.food) {
        setFoodList((prev) =>
          prev.map((food) =>
            String(food._id || food.id) === String(foodId) ? data.food : food
          )
        );
      } else {
        setFoodList((prev) =>
          prev.map((food) =>
            String(food._id || food.id) === String(foodId)
              ? {
                  ...food,
                  reviews: [...(food.reviews || []), review],
                }
              : food
          )
        );
      }
    } catch (err) {
      setFoodList((prev) =>
        prev.map((food) =>
          String(food._id || food.id) === String(foodId)
            ? {
                ...food,
                reviews: [...(food.reviews || []), review],
              }
            : food
        )
      );
    }
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      if (qty > 0) {
        const item = foodList.find((f) => f._id === itemId);
        if (item) total += item.price * qty;
      }
      return total;
    }, 0);
  };

  if (!initialized) return null;

  return (
    <StoreContext.Provider
      value={{
        foodList,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        isAdmin,
        setIsAdmin,
        login: (t, a) => {
          setToken(t);
          setIsAdmin(a);
          localStorage.setItem("token", t);
          localStorage.setItem("isAdmin", a ? "true" : "false");
          localStorage.removeItem("cartItems");
          setUser(null);
        },
        logout: () => {
          setToken("");
          setIsAdmin(false);
          setUser(null);
          setOrders([]);
          localStorage.removeItem("token");
          localStorage.setItem("isAdmin", "false");
          setCartItems({});
          localStorage.removeItem("cartItems");
        },
        fetchFoodList,
        reloadAll,
        user,
        setUser,
        orders,
        fetchOrders,
        addReview,
        refreshFoodAfterOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
