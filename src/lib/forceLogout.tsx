export function forceLogout(redirect = true) {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth:token");
  localStorage.removeItem("auth:user");
  localStorage.removeItem("auth:refreshToken");
  localStorage.removeItem("persist:root");

  document.cookie =
    "auth:token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "auth:user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  if (redirect) {
    window.location.href = "/";
  }
}
