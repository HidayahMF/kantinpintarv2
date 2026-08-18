import React, { createContext, useCallback, useEffect, useState } from "react";
import API from "../api";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [foodList, setFoodList] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cartItems");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // === INITIAL TOKEN & ADMIN CHECK ===
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const isAdminFromUrl = params.get("isAdmin");

    let t = tokenFromUrl || localStorage.getItem("token") || "";
    let a =
      isAdminFromUrl === "true" ||
      localStorage.getItem("isAdmin") === "true" ||
      false;

    if (tokenFromUrl) localStorage.setItem("token", tokenFromUrl);
    if (isAdminFromUrl) localStorage.setItem("isAdmin", isAdminFromUrl);

    // Clean URL params
    if (tokenFromUrl || isAdminFromUrl) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    setToken(t);
    setIsAdmin(a);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
  }, [token, isAdmin, initialized]);

  // === FETCH USER INFO ===
  useEffect(() => {
    if (!initialized || !token) {
      setUser(null);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const res = await API.get("/user/me");
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          setIsAdmin(res.data.user.isAdmin === true);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Fetch user error:", err.message);
        setUser(null);
        setIsAdmin(false);
      }
    };

    fetchUserInfo();
  }, [token, initialized]);

  // === FETCH FOOD LIST ===
  const fetchFoodList = useCallback(async () => {
    try {
      const res = await API.get("/food/list");

      if (Array.isArray(res.data)) {
        setFoodList(res.data);
      } else if (res.data?.success && Array.isArray(res.data.data)) {
        setFoodList(res.data.data);
      } else {
        setFoodList([]);
      }
    } catch (err) {
      console.error("Error fetching food list:", err.message);
      setFoodList([]);
    }
  }, []);

  // === LOAD CART DATA ===
  const loadCartData = async () => {
    try {
      const res = await API.get("/cart/get");
      setCartItems(res.data.cartData || {});
    } catch {
      setCartItems({});
    }
  };

  // === FETCH ORDERS ===
  const fetchOrders = async () => {
    if (!token) {
      setOrders([]);
      return;
    }
    try {
      const res = await API.get("/order/userorders");
      if (res.data.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }
  };

  // === CART FUNCTIONS ===
  const addToCart = async (itemId) => {
    const item = foodList.find((f) => f._id === itemId);
    if (!item) return;

    const currentQty = cartItems[itemId] || 0;
    const stock = item.stock ?? 0;
    if (currentQty + 1 > stock) return;

    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await API.post("/cart/add", { itemId });
      } catch (err) {
        console.error("Error adding to cart:", err.message);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) updated[itemId]--;
      else delete updated[itemId];
      return updated;
    });

    if (token) {
      try {
        await API.post("/cart/remove", { itemId });
      } catch (err) {
        console.error("Error removing from cart:", err.message);
      }
    }
  };

  // === ADD REVIEW ===
  const addReview = async (foodId, review) => {
    try {
      const res = await API.post("/food/review", {
        foodId,
        rating: review?.rating,
        comment: review?.comment,
      });
      if (res.data?.success && res.data.food) {
        setFoodList((prev) =>
          prev.map((food) =>
            String(food._id || food.id) === String(foodId)
              ? res.data.food
              : food
          )
        );
        return res.data;
      }
      return res.data;
    } catch (err) {
      console.error("Error adding review:", err.message);
      throw err;
    }
  };

  // === LOCAL STORAGE SYNC ===
  useEffect(() => {
    if (!token) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  // === INITIAL LOAD ===
  useEffect(() => {
    if (!initialized) return;

    const init = async () => {
      await fetchFoodList();
      if (token) {
        await loadCartData();
        await fetchOrders();
      }
    };
    init();
  }, [initialized, token]);

  // === HELPER ===
  const getTotalCartAmount = () =>
    Object.entries(cartItems).reduce((total, [id, qty]) => {
      const item = foodList.find((f) => f._id === id);
      return item ? total + item.price * qty : total;
    }, 0);

  const reloadAll = async () => {
    await fetchFoodList();
    if (token) {
      await loadCartData();
      await fetchOrders();
    }
  };

  // === LOGIN & LOGOUT HANDLERS ===
  const login = (newToken, isAdminFlag = false) => {
    setToken(newToken);
    setIsAdmin(isAdminFlag);
    localStorage.setItem("token", newToken);
    localStorage.setItem("isAdmin", isAdminFlag ? "true" : "false");
  };

  const logout = () => {
    setToken("");
    setIsAdmin(false);
    setUser(null);
    setCartItems({});
    setOrders([]);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("cartItems");
  };

  if (!initialized) return <div>Loading...</div>;

  return (
    <StoreContext.Provider
      value={{
        url,
        token,
        setToken,
        isAdmin,
        setIsAdmin,
        user,
        setUser,
        foodList,
        fetchFoodList,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        addReview,
        getTotalCartAmount,
        reloadAll,
        orders,
        fetchOrders,
        login,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
