// Global backend URL — read from .env (VITE_BACKEND_URL)
// In Vite, all env vars must be prefixed with VITE_ to be accessible client-side.
// Usage: import { BACKEND_URL } from "../config";

export const BACKEND_URL: string =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

export const API_URL: string = `${BACKEND_URL}/api`;
