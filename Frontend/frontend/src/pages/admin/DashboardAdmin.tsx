import React, { useState, useEffect } from "react";
import "./DashboardAdmin.css";
import { Bar, Line } from "react-chartjs-2";
import KontenEdukasi from "./KontenEdukasi";
import HargaAsset from "./HargaAsset";
import User from "./UserAdmin";
import Mentor from "./Mentor";
import AdminInbox from "./AdminInbox";
import CryptoNewsWidget from "../../components/CryptoNewsWidget";
import API from "../services/api";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Filler, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

type Menu = "beranda" | "inbox" | "edukasi" | "harga" | "user" | "mentor";

export default function DashboardAdmin() {
  const [menu, setMenu] = useState<Menu>("beranda");
  const [stats, setStats] = useState({ users: 0, mentors: 0, coins: 0 });
  const [adminName, setAdminName] = useState("");
  
  const [topBuyers, setTopBuyers] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [topQuiz, setTopQuiz] = useState<any[]>([]);
  const [apiTraffic, setApiTraffic] = useState<any[]>([]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setAdminName(user.name || "Administrator");
    } catch {
      setAdminName("Administrator");
    }

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

  const menuItems: { key: Menu; label: string; icon: string }[] = [
    { key: "beranda", label: "Manajemen Sistem", icon: "settings" },
    { key: "inbox", label: "Pesan Masuk", icon: "mail" },
    { key: "edukasi", label: "Konten Edukasi", icon: "school" },
    { key: "harga", label: "Harga & Aset", icon: "show_chart" },
    { key: "user", label: "Data Pengguna", icon: "group" },
    { key: "mentor", label: "Tambah Mentor", icon: "person_add" },
  ];

  const formatChartData = (label: string, data: any[], xKey: string, yKey: string, color: string, bgColor: string) => ({
    labels: data.map(item => item[xKey] || "User"),
    datasets: [{
      label,
      data: data.map(item => item[yKey] || 0),
      backgroundColor: bgColor,
      borderColor: color,
      borderWidth: 1,
      borderRadius: 4,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" } as any },
      x: { grid: { display: false } as any }
    }
  };

  const buyersChart = formatChartData("Transaksi Beli", topBuyers, "name", "count", "#00E5FF", "rgba(0, 229, 255, 0.3)");
  const lineChartData = {
    labels: apiTraffic.map(item => item.date),
    datasets: [{
      label: "API Calls",
      data: apiTraffic.map(item => item.count),
      fill: true,
      borderColor: "#5203d5",
      backgroundColor: "rgba(82, 3, 213, 0.15)",
      tension: 0.4,
      pointBackgroundColor: "#5203d5",
      borderWidth: 2,
    }],
  };

  return (
    <div className="admin-dashboard-root custom-scrollbar">
      <aside className="executive-sidebar">
        <div className="logo-container">KRIPTO-Z<span className="logo-sub">Executive Control</span></div>
        <nav>
          <ul className="executive-nav-list">
            {menuItems.map((item) => (
              <li key={item.key}>
                <div className={`executive-nav-item ${menu === item.key ? "active" : ""}`} onClick={() => setMenu(item.key)}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="logout-item" onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
            <span className="material-symbols-outlined">logout</span>
            <span>Keluar Sistem</span>
          </div>
        </div>
      </aside>

      <main className="executive-main">
        <header className="executive-header">
          <div className="header-left"><span className="brand-logo-text">KRIPTO-Z</span></div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#849396' }}>search</span>
              <input type="text" placeholder="Cari data..." />
            </div>
            <div className="header-actions">
              <button className="bell-btn material-symbols-outlined">notifications</button>
              <div className="header-divider"></div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="admin-profile-info">
                  <span className="admin-name">Halo, {adminName}</span>
                  <span className="admin-role">Admin</span>
                </div>
                <img className="admin-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi0bo4rgKaSeLjaz3mLu_19QK0sFi7T1SVv3SRgrkQjzypmsizpTSvn_1kxvatWWRlbtlAz0lH22MjF71XyfsUFXhLbs-QcmJWPgOjzNFtmrkjUtsdp8Z8SXx3Jd0dMZXzN2nr5Gl4I92cB_4TA-jonDwr-yjb6tzm0mzvKjXhw6rI1ApkDXJn_2qMeCfo7bcvKrgyRE-dkipvkzwk-0E1iU9R6sf0Rq4NqPkddO-KxqhoYoeuXVa-QrA9zDbzMOfKKJczDCs5jg" alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        <section className="executive-content custom-scrollbar">
          {menu === "beranda" && (
            <>
              <div className="welcome-section">
                <div>
                  <h1 className="welcome-title">Halo, {adminName} 👋</h1>
                  <p className="welcome-subtitle">Selamat datang kembali. Berikut adalah ikhtisar performa ekosistem KRIPTO-Z hari ini.</p>
                </div>
                <div className="action-buttons">
                  <button className="btn-secondary"><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span> Unduh Laporan</button>
                  <button className="btn-primary">Buat Pengumuman</button>
                </div>
              </div>

              <div className="bento-grid">
                <div className="metric-card">
                  <div className="circle-accent circle-primary"></div>
                  <div className="metric-header">
                    <div className="icon-box primary"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span></div>
                    <span className="metric-label">Total Users</span>
                  </div>
                  <div className="metric-body">
                    <h2 className="metric-value">{stats.users.toLocaleString()}</h2>
                    <div className="metric-change up"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> +12%</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="circle-accent circle-tertiary"></div>
                  <div className="metric-header">
                    <div className="icon-box tertiary"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span></div>
                    <span className="metric-label">Active Mentors</span>
                  </div>
                  <div className="metric-body">
                    <h2 className="metric-value">{stats.mentors}</h2>
                    <div className="metric-change up"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> +2</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="circle-accent circle-error"></div>
                  <div className="metric-header">
                    <div className="icon-box error"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span></div>
                    <span className="metric-label">New Messages</span>
                  </div>
                  <div className="metric-body">
                    <h2 className="metric-value">24</h2>
                    <div className="badge-urgent">URGENT</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="circle-accent circle-secondary"></div>
                  <div className="metric-header">
                    <div className="icon-box secondary"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>currency_bitcoin</span></div>
                    <span className="metric-label">Asset/Coins</span>
                  </div>
                  <div className="metric-body">
                    <h2 className="metric-value">{stats.coins}</h2>
                    <div style={{ color: 'var(--admin-on-surface-variant)', fontSize: '0.875rem', fontWeight: 500 }}>Synced</div>
                  </div>
                </div>
              </div>

              <div className="main-grid">
                <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Statistik Penjualan</h3>
                      <p className="panel-subtitle">Status transaksi pasar secara real-time</p>
                    </div>
                    <button className="panel-action-text">Kelola Data</button>
                  </div>
                  
                  <div className="chart-container-glass" style={{ height: '240px' }}>
                    <Bar data={buyersChart} options={chartOptions} />
                  </div>

                  <div className="panel-header" style={{ paddingTop: '1rem' }}>
                    <div>
                      <h3 className="panel-title">Traffic Pemanggilan API</h3>
                      <p className="panel-subtitle">7 Hari Terakhir</p>
                    </div>
                  </div>
                  <div className="chart-container-glass" style={{ height: '200px' }}>
                    <Line data={lineChartData} options={chartOptions} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="panel-card">
                    <div className="panel-header">
                      <h3 className="panel-title">Crypto News & Intel</h3>
                      <button className="material-symbols-outlined" style={{ background: 'none', border: 'none', color: '#849396', cursor: 'pointer' }}>add_box</button>
                    </div>
                    <div style={{ padding: '0 2rem 2rem 2rem' }}>
                      <CryptoNewsWidget />
                    </div>
                  </div>

                  <div className="support-card">
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '100px', fontWeight: 700 }}>auto_awesome</span>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>Butuh Bantuan Teknis?</h3>
                    <p style={{ fontSize: '0.875rem', color: '#849396', marginBottom: '1.5rem', lineHeight: 1.6 }}>Hubungi tim developer KRIPTO-Z jika Anda mengalami kendala pada sistem manajemen API & Routing.</p>
                    <a href="mailto:support@kriptoz.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#00E5FF', fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', textDecoration: 'none' }}>
                      Hubungi Support <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {menu === "edukasi" && <KontenEdukasi />}
          {menu === "harga" && <HargaAsset />}
          {menu === "user" && <User />}
          {menu === "mentor" && <Mentor />}
          {menu === "inbox" && <AdminInbox />}
        </section>
      </main>
    </div>
  );
}
