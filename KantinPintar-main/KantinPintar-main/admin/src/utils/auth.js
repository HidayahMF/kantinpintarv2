export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isAdmin");
  window.location.href = "/login"; 
};