import React, { useState, useEffect } from "react";
import "./DashboardAdmin.css";
import { Line } from "react-chartjs-2";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Users,
  GraduationCap,
  LogOut,
} from "lucide-react";
import KontenEdukasi from "./KontenEdukasi";
import HargaAsset from "./HargaAsset";
import User from "./User";
import Mentor from "./Mentor";
import API from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type Menu = "beranda" | "edukasi" | "harga" | "user" | "mentor";

const menuItems: { key: Menu; label: string; icon: React.ReactNode }[] = [
  { key: "beranda", label: "Manajemen Sistem", icon: <LayoutDashboard size={18} /> },
  { key: "edukasi", label: "Konten Edukasi", icon: <BookOpen size={18} /> },
  { key: "harga", label: "Harga & Aset", icon: <TrendingUp size={18} /> },
  { key: "user", label: "Data Pengguna", icon: <Users size={18} /> },
  { key: "mentor", label: "Tambah Mentor", icon: <GraduationCap size={18} /> },
];

const DashboardAdmin: React.FC = () => {
  const [menu, setMenu] = useState<Menu>("beranda");
  const [stats, setStats] = useState({ users: 0, mentors: 0, coins: 0 });
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    // Get admin name
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setAdminName(user.name || "Admin");
    } catch {
      setAdminName("Admin");
    }

    // Fetch live stats
    const fetchStats = async () => {
      try {
        const [usersRes, mentorsRes, coinsRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/user"),
          API.get("/mentor"),
          fetch("http://localhost:5000/api/trade/coins"),
        ]);

        const usersData = await usersRes.json();
        const coinsData = await coinsRes.json();

        setStats({
          users: Array.isArray(usersData.data) ? usersData.data.length : 0,
          mentors: Array.isArray(mentorsRes.data) ? mentorsRes.data.length : 0,
          coins: coinsData.data?.length || 0,
        });
      } catch (err) {
        console.error("Stats error:", err);
      }
    };

    fetchStats();
  }, []);

  const chartData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        label: "Transaksi",
        data: [12, 19, 8, 25, 15, 30, 22],
        fill: true,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.08)",
        tension: 0.4,
        pointBackgroundColor: "#38bdf8",
      },
    ],
  };

  return (
    <div className="admin-container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">KRIPTO-Z <span>ADMIN</span></h2>

        <ul>
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={menu === item.key ? "active" : ""}
              onClick={() => setMenu(item.key)}
            >
              {item.icon}
              {item.label}
            </li>
          ))}
        </ul>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut size={16} />
          Keluar Sistem
        </button>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* ================= BERANDA ================= */}
        {menu === "beranda" && (
          <>
            <h1>Halo, {adminName} 👋</h1>

            <div className="cards">
              <div className="card">
                <div className="card-icon users-icon">
                  <Users size={22} />
                </div>
                <div>
                  <p>Total Pengguna</p>
                  <h2>{stats.users}</h2>
                </div>
              </div>

              <div className="card">
                <div className="card-icon mentors-icon">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <p>Total Mentor</p>
                  <h2>{stats.mentors}</h2>
                </div>
              </div>

              <div className="card">
                <div className="card-icon coins-icon">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <p>Total Koin Aktif</p>
                  <h2>{stats.coins}</h2>
                </div>
              </div>

              <div className="card">
                <div className="card-icon status-icon">
                  <LayoutDashboard size={22} />
                </div>
                <div>
                  <p>Status Server</p>
                  <h2 className="green">Online ●</h2>
                </div>
              </div>
            </div>

            <div className="chart-box">
              <h3>Aktivitas Transaksi Mingguan</h3>
              <Line data={chartData} />
            </div>
          </>
        )}

        {menu === "edukasi" && <KontenEdukasi />}
        {menu === "harga" && <HargaAsset />}
        {menu === "user" && <User />}
        {menu === "mentor" && <Mentor />}

      </div>
    </div>
  );
};

export default DashboardAdmin;
