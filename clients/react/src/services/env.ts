export const API_URL = (() => {
  const envUrl =
    (import.meta.env.PRIMARY_BACKEND_URL as string | undefined) ??
    "http://localhost:4200";
  if (typeof window === "undefined") return envUrl;
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  return isLocal ? envUrl : "https://pharmetrix.onrender.com";
})();

// console.log("Current Environment ", API_URL);