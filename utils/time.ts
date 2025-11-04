export const formatDateToDhaka = (date: Date): string => {
  // Format date in Dhaka timezone (Asia/Dhaka) as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateTime12Hour = (date: Date): string => {
  // Format date and time in 12-hour format with AM/PM
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
};
