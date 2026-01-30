import React, { useState } from "react";
import "./Login.css";

interface LoginProps {
  goToRegister: () => void;
  goToDashboard: () => void; // ✅ TAMBAHAN
}

const Login: React.FC<LoginProps> = ({
  goToRegister,
  goToDashboard, // ✅ TERIMA DARI APP
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

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

        <label>Username / Email</label>
        <input type="text" placeholder="admin@admin.com" />

        <label>Password</label>
        <div className="password-wrapper">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="••••••••"
          />

          <span
            className="eye-toggle"
            onClick={() => setPasswordVisible(prev => !prev)}
          >
            {passwordVisible ? "🙈" : "👁"}
          </span>
        </div>

        {/* ✅ PINDAH KE DASHBOARD */}
        <button className="login-btn" onClick={goToDashboard}>
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
