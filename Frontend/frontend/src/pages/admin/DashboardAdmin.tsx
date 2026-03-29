import React, { useState, useEffect } from "react";
import "./DashboardAdmin.css";
import { Bar, Line } from "react-chartjs-2";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Users,
  GraduationCap,
  LogOut,
  MessageSquare,
} from "lucide-react";
import KontenEdukasi from "./KontenEdukasi";
import HargaAsset from "./HargaAsset";
import User from './User'
import Mentor from "./Mentor";
import AdminInbox from "./AdminInbox";
import CryptoNewsWidget from "../../components/CryptoNewsWidget";
import API from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

type Menu = "beranda" | "edukasi" | "harga" | "user" | "mentor" | "inbox";

const menuItems: { key: Menu; label: string; icon: React.ReactNode }[] = [
  { key: "beranda", label: "Manajemen Sistem", icon: <LayoutDashboard size={18} /> },
  { key: "inbox", label: "Pesan Masuk", icon: <MessageSquare size={18} /> },
  { key: "edukasi", label: "Konten Edukasi", icon: <BookOpen size={18} /> },
  { key: "harga", label: "Harga & Aset", icon: <TrendingUp size={18} /> },
  { key: "user", label: "Data Pengguna", icon: <Users size={18} /> },
  { key: "mentor", label: "Tambah Mentor", icon: <GraduationCap size={18} /> },
];

const DashboardAdmin: React.FC = () => {
  const [menu, setMenu] = useState<Menu>("beranda");
  const [stats, setStats] = useState({ users: 0, mentors: 0, coins: 0 });
  const [adminName, setAdminName] = useState("");
  
  const [topBuyers, setTopBuyers] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [topQuiz, setTopQuiz] = useState<any[]>([]);
  const [apiTraffic, setApiTraffic] = useState<any[]>([]);

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
        const [usersRes, mentorsRes, coinsRes, statsRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/user"),
          API.get("/mentor"),
          fetch("http://localhost:5000/api/trade/coins"),
          fetch("http://localhost:5000/api/admin/dashboard-stats"),
        ]);

        const usersData = await usersRes.json();
        const coinsData = await coinsRes.json();
        const dashStats = await statsRes.json();

        setStats({
          users: Array.isArray(usersData.data) ? usersData.data.length : 0,
          mentors: Array.isArray(mentorsRes.data) ? mentorsRes.data.length : 0,
          coins: coinsData.data?.length || 0,
        });

        if (dashStats.success) {
          setTopBuyers(dashStats.data.topBuyers || []);
          setTopSellers(dashStats.data.topSellers || []);
          setTopQuiz(dashStats.data.topQuiz || []);
          setApiTraffic(dashStats.data.apiTraffic || []);
        }

      } catch (err) {
        console.error("Stats error:", err);
      }
    };

    fetchStats();
  }, []);

  // Prepare Chart Data
  const formatChartData = (label: string, data: any[], xKey: string, yKey: string, color: string, bgColor: string) => {
    return {
      labels: data.map(item => item[xKey] || "User"),
      datasets: [
        {
          label: label,
          data: data.map(item => item[yKey] || 0),
          backgroundColor: bgColor,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" } },
      x: { grid: { display: false } }
    }
  };

  const buyersChart = formatChartData("Transaksi Beli", topBuyers, "name", "count", "#38bdf8", "rgba(56, 189, 248, 0.6)");
  const sellersChart = formatChartData("Transaksi Jual", topSellers, "name", "count", "#ec4899", "rgba(236, 72, 153, 0.6)");
  const quizChart = formatChartData("Total Kuis Selesai", topQuiz, "name", "quizzesTaken", "#22c55e", "rgba(34, 197, 94, 0.6)");

  const lineChartData = {
    labels: apiTraffic.map(item => item.date),
    datasets: [
      {
        label: "API Calls Server Traffic",
        data: apiTraffic.map(item => item.count),
        fill: true,
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.15)",
        tension: 0.4,
        pointBackgroundColor: "#a855f7",
        borderWidth: 2,
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

            <div className="charts-grid">
              <div className="chart-box">
                <h3>Top 5 Siswa Sering Beli (BUY)</h3>
                <div className="canvas-container">
                  <Bar data={buyersChart} options={chartOptions} />
                </div>
              </div>

              <div className="chart-box">
                <h3>Top 5 Siswa Sering Jual (SELL)</h3>
                <div className="canvas-container">
                  <Bar data={sellersChart} options={chartOptions} />
                </div>
              </div>

              <div className="chart-box">
                <h3>Top 5 Siswa Aktif Kuis</h3>
                <div className="canvas-container">
                  <Bar data={quizChart} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="chart-box line-chart-container">
              <h3>Traffic Pemanggilan API (7 Hari Terakhir)</h3>
              <div className="canvas-container">
                <Line data={lineChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
              </div>
            </div>

            <CryptoNewsWidget />
          </>
        )}

        {menu === "edukasi" && <KontenEdukasi />}
        {menu === "harga" && <HargaAsset />}
        {menu === "user" && <User />}
        {menu === "mentor" && <Mentor />}
        {menu === "inbox" && <AdminInbox />}

      </div>
    </div>
  );
};

export default DashboardAdmin;
