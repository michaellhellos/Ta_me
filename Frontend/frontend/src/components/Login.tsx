import React, { useState } from "react";
import "./Login.css";

interface LoginProps {
  goToRegister: () => void;
  goToDashboard: () => void;
}

const Login: React.FC<LoginProps> = ({
  goToRegister,
  goToDashboard,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email dan password wajib diisi");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      // ✅ LOGIN BERHASIL
      localStorage.setItem("user", JSON.stringify(data.user));
      goToDashboard();

    } catch (error) {
      setMessage("Gagal terhubung ke server");
    }
  };

  return (
    <div className="container">
      <div className="card">

        {/* ROBOT */}
        <div className={`robot ${passwordVisible ? "alive" : "dead"}`}>
          <div className="antenna" />
          <div className="robot-face">
            <div className="eye left" />
            <div className="eye right" />
            <div className="mouth" />
          </div>
        </div>

        <h1>Kripto-Z</h1>
        <p className="subtitle">Login User / Admin</p>

        <label>Email</label>
        <input
          type="text"
          placeholder="admin@admin.com"
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
            className="eye-toggle"
            onClick={() => setPasswordVisible(prev => !prev)}
          >
            {passwordVisible ? "🙈" : "👁"}
          </span>
        </div>

        {message && <p style={{ color: "red" }}>{message}</p>}

        {/* ✅ LOGIN KE BACKEND */}
        <button className="login-btn" onClick={handleLogin}>
          Masuk ⚡
        </button>

        <p className="register">
          Belum punya akun?{" "}
          <span onClick={goToRegister}>Daftar dulu</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
