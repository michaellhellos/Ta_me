import "./Register.css";

interface RegisterProps {
  goToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ goToLogin }) => {
  return (
    <div className="container">
      <div className="card">
        <h1>Kripto-Z</h1>
        <p className="subtitle">Buat akun & mulai belajar cuan!</p>

        <label>Username</label>
        <input type="text" placeholder="Contoh: Satoshi" />

        <label>Email</label>
        <input type="email" placeholder="email@kamu.com" />

        <label>Password</label>
        <input type="password" placeholder="••••••••" />

        <button className="register-btn">
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
