export const formatRp = (num) => {
  const value = Number(num) || 0;
  return "Rp " + value.toLocaleString("id-ID");
};
