import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { API_URL } from "../config";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login gagal");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user._id);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "mentor") {
        navigate("/mentor/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      setMessage("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <h1>Kripto-Z</h1>
          <p>Simulasi Trading Crypto — Belajar Tanpa Risiko</p>
        </div>

        <div className="form-group">
          <label><Mail /> Email</label>
          <input
            type="email"
            placeholder="user@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label><Lock /> Password</label>
          <div className="password-field">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setPasswordVisible((prev) => !prev)}
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {message && <div className="login-error">{message}</div>}

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>

        <p className="login-footer">
          Belum punya akun?{" "}
          <span onClick={() => navigate("/register")}>Daftar Sekarang</span>
        </p>
      </div>
    </div>
  );
};

export default Login;