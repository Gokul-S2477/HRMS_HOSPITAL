// frontend/src/core/auth/auth.ts
// small auth helper: store token, decode JWT (no extra libs)

export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

/**
 * Decode JWT payload (no verification) and return object or null.
 * Works for standard JWT format header.payload.signature
 */
export const decodeJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // add padding for atob
    const pad = payload.length % 4 === 0 ? payload : payload + "=".repeat(4 - (payload.length % 4));
    const decoded = atob(pad.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
};
