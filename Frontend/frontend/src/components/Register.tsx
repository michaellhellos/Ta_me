import { useState } from "react";
import "./Register.css";

interface RegisterProps {
  goToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ goToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 👉 fungsi register
  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Register berhasil 🎉");
      setTimeout(() => goToLogin(), 1500);

    } catch (error) {
      setMessage("Gagal koneksi ke server");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Kripto-Z</h1>
        <p className="subtitle">Buat akun & mulai belajar cuan!</p>

        <label>Username</label>
        <input
          type="text"
          placeholder="Contoh: Satoshi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="email@kamu.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p style={{ color: "red" }}>{message}</p>}

        <button className="register-btn" onClick={handleRegister}>
          Daftar Sekarang 🚀
        </button>

        <p className="login-link">
          Sudah punya akun?{" "}
          <span
            onClick={goToLogin}
            style={{ cursor: "pointer", color: "#4f46e5" }}
          >
            Login di sini
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
