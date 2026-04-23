// Global backend URL — read from .env (VITE_BACKEND_URL)
// In Vite, all env vars must be prefixed with VITE_ to be accessible client-side.
// Usage: import { BACKEND_URL, API_URL } from "../config";

// Strip trailing slash to prevent double-slash (e.g. if VITE_BACKEND_URL="https://x.vercel.app/")
export const BACKEND_URL: string =
  (import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

export const API_URL: string = `${BACKEND_URL}/api`;

// Socket.IO is NOT supported on Vercel serverless — disable it in production.
// Set VITE_ENABLE_SOCKET=true in .env only when backend runs on a real server (Railway/Render/VPS).
export const SOCKET_ENABLED: boolean =
  import.meta.env.VITE_ENABLE_SOCKET === "true";
