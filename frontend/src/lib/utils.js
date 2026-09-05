export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatApiError(err, defaultMessage = "Request failed") {
  if (!err) return defaultMessage;

  // Handle network failure / connection refused / server offline
  if (
    err.code === "ERR_NETWORK" ||
    err.message === "Network Error" ||
    !err.response
  ) {
    return "Unable to connect to server";
  }

  const status = err.response?.status;
  const detail = err.response?.data?.detail;

  if (status === 401) {
    return typeof detail === "string" ? detail : "Invalid email or password";
  }

  if (status === 403) {
    return typeof detail === "string" ? detail : "Access denied. Insufficient permissions.";
  }

  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join(", ");
  }
  if (detail && typeof detail === "object") {
    return JSON.stringify(detail);
  }

  return err.response?.data?.message || err.message || defaultMessage;
}
