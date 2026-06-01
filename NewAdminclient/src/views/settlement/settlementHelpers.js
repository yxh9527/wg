import dayjs from "dayjs";

export const formatUnixDateTime = (value) => {
  if (!value) return "";
  const num = Number(value);
  const ms = num > 1000000000000 ? num : num * 1000;
  return dayjs(ms).format("YYYY-MM-DD HH:mm:ss");
};

export const toMoney = (value, digits = 2) => {
  const num = Number(value || 0);
  return num.toFixed(digits);
};
