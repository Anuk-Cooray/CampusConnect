const envApi = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const isLocalHost =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE = isLocalHost ? "http://localhost:5000" : envApi || "http://localhost:5000";

