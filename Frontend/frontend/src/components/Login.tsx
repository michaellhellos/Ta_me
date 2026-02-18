import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login gagal");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect berdasarkan role
      // Redirect berdasarkan role
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");

        } else if (data.user.role === "mentor") {
          navigate("/mentor/dashboard");

        } else {
          navigate("/dashboard");
        }
    } catch {
      setMessage("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">

        <h1>Kripto-Z</h1>
        <p className="subtitle">Login User / Admin</p>

        <label>Email</label>
        <input
          type="email"
          placeholder="user@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <div className="password-wrapper">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setPasswordVisible((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            {passwordVisible ? "🙈" : "👁"}
          </span>
        </div>

        {message && <p style={{ color: "red" }}>{message}</p>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Masuk..." : "Masuk"}
        </button>

        <p>
          Belum punya akun?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Daftar
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
