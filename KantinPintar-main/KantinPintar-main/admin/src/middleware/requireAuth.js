
import { clearToken } from "../utils/auth";

export const checkAuth = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    clearToken();
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp < currentTime) {
      clearToken();
      return false;
    }
  } catch (e) {
    console.error("Invalid token format", e);
    clearToken();
    return false;
  }

  return true;
};