import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: API_URL
});

// otomatis kirim token kalau ada
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
