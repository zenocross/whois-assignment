export const processDateField = (dateString) => {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  // Formats the date to MM/DD/YYYY
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const processDomainAgeField = (domainAgeDays) => {
  if (!domainAgeDays || isNaN(domainAgeDays)) return "Unknown age";

  // These could be modified further to show more accuracy when needed (Handling leap year, more accurate month counts etc.).
  const years = Math.floor(domainAgeDays / 365);
  const remainingDays = domainAgeDays % 365;
  const months = Math.floor(remainingDays / 30);

  let result = "";
  if (years > 0) {
    result += `${years} ${years === 1 ? "year" : "years"}`;
  }
  if (months > 0) {
    if (result) result += " and ";
    result += `${months} ${months === 1 ? "month" : "months"}`;
  }

  return result || "< 1 month";
};

export const truncateString = (str, maxLength) => {
  if (str.length > maxLength) {
    return `${str.slice(0, maxLength)}...`;
  }
  return str;
};
