import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        setSuccess(false);
        return;
      }

      setMessage("Register berhasil! Redirecting...");
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setMessage("Gagal koneksi ke server");
      setSuccess(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-brand">
          <h1>Kripto-Z</h1>
          <p>Buat akun & mulai belajar cuan!</p>
        </div>

        <div className="form-group">
          <label><User /> Username</label>
          <input
            type="text"
            placeholder="Contoh: Satoshi"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label><Mail /> Email</label>
          <input
            type="email"
            placeholder="email@kamu.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label><Lock /> Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {message && (
          <div className={success ? "register-success" : "register-error"}>
            {message}
          </div>
        )}

        <button className="register-btn" onClick={handleRegister}>
          Daftar Sekarang 🚀
        </button>

        <p className="register-footer">
          Sudah punya akun?{" "}
          <span onClick={() => navigate("/")}>Login di sini</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
