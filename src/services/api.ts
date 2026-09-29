import axios from "axios";
import type { ApiResponse, AuthResponse } from "../types/user.types";
import {
  clearSession,
  getRefreshToken,
  isRefreshTokenValid,
  getToken,
  saveSession,
} from "../utils/tokenStorage";
import { showGlobalToast } from "../contexts/ToastContext";
import { showSessionExpiredModal } from "../contexts/SessionExpiredModal";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const api = axios.create({ baseURL });

// Plain axios (no interceptors) so the refresh call itself never triggers
// the 401 handler below and loops.
const refreshClient = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

/** Thrown when the refresh token is already expired — we know this from the
 * stored `refreshExpiresInMs` alone, no need to call the server. */
class RefreshTokenExpiredError extends Error {}

let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    // Check refreshExpiresInMs client-side first — if it's already past,
    // there's no point calling the server at all.
    if (!isRefreshTokenValid()) {
      throw new RefreshTokenExpiredError();
    }
    const refreshToken = getRefreshToken() as string;
    const res = await refreshClient.post<ApiResponse<AuthResponse>>("/auth/refresh", {
      refreshToken,
    });
    const auth = res.data.result;
    // Refresh Token Rotation: the server issues a brand-new refresh token on
    // every use and invalidates the old one, so we must overwrite it here —
    // never keep reusing the same refreshToken across calls.
    saveSession({
      token: auth.token,
      expiresAt: Date.now() + auth.expiresInMs,
      refreshToken: auth.refreshToken,
      refreshExpiresAt: Date.now() + auth.refreshExpiresInMs,
    });
    return auth.token;
  })();

  return refreshPromise.finally(() => {
    refreshPromise = null;
  });
}

let hasHandledAuthFailure = false;

/** Refresh token already expired — no server round-trip happened. Show a
 * blocking modal the user must acknowledge before being sent to /login. */
function handleRefreshTokenExpired() {
  clearSession();
  if (hasHandledAuthFailure) return;
  hasHandledAuthFailure = true;
  showSessionExpiredModal();
}

/** Refresh token looked valid but the server call itself failed (revoked,
 * network error, etc). Toast + short delay, then redirect. */
function handleRefreshCallFailed() {
  clearSession();
  if (hasHandledAuthFailure) return;
  hasHandledAuthFailure = true;
  showGlobalToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "error");
  // Give the toast a moment on screen before the hard reload to /login wipes it.
  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => config?.url?.includes(path));

    if (response?.status !== 401 || isAuthEndpoint || config._retried) {
      return Promise.reject(error);
    }

    try {
      config._retried = true;
      const newToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (refreshError) {
      if (refreshError instanceof RefreshTokenExpiredError) {
        handleRefreshTokenExpired();
      } else {
        handleRefreshCallFailed();
      }
      return Promise.reject(error);
    }
  }
);
