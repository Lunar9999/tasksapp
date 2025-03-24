export const useDate = (date?: string): string => {
  if (!date) return "N/A";

  try {
    const fullDate = new Date(date);
    if (isNaN(fullDate.getTime())) return "Invalid Date";

    const year = fullDate.getFullYear();
    const month = (fullDate.getMonth() + 1).toString().padStart(2, '0');
    const day = fullDate.getDate().toString().padStart(2, '0');

    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};
export default useDate