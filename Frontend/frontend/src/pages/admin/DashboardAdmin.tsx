import React, { useState } from "react";
import "./DashboardAdmin.css";
import { Line } from "react-chartjs-2";
import KontenEdukasi from "./KontenEdukasi";
import HargaAsset from "./HargaAsset"; // <-- IMPORT INI
import User from "./user"; // <-- IMPORT INI  
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
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

type Menu = "beranda" | "edukasi" | "harga" | "user";

const DashboardAdmin: React.FC = () => {
  const [menu, setMenu] = useState<Menu>("beranda");

  const chartData = {
    labels: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
    datasets: [
      {
        label: "Traffic",
        data: [20, 45, 80, 40, 90, 120],
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="admin-container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">KRIPTO-Z <span>ADMIN</span></h2>

        <ul>
          <li
            className={menu === "beranda" ? "active" : ""}
            onClick={() => setMenu("beranda")}
          >
            📊 Manajemen Sistem
          </li>

          <li
            className={menu === "edukasi" ? "active" : ""}
            onClick={() => setMenu("edukasi")}
          >
            📚 Konten Edukasi
          </li>

          <li
            className={menu === "harga" ? "active" : ""}
            onClick={() => setMenu("harga")}
          >
            💰 Harga & Aset
          </li>
          <li
            className={menu === "user" ? "active" : ""}
            onClick={() => setMenu("user")}
          >
            💰Data Pengguna
          </li>
        </ul>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          Keluar Sistem
        </button>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* ================= BERANDA ================= */}
        {menu === "beranda" && (
          <>
            <h1>Ringkasan Sistem</h1>

            <div className="cards">
              <div className="card">
                <p>Status Server</p>
                <h2 className="green">Operational ●</h2>
              </div>

              <div className="card">
                <p>Total API Calls</p>
                <h2>42,501</h2>
              </div>

              <div className="card">
                <p>System Uptime</p>
                <h2>99.98%</h2>
              </div>

              <div className="card">
                <p>Database Size</p>
                <h2>1.2 GB</h2>
              </div>
            </div>

            <div className="chart-box">
              <h3>Grafik Beban Sistem (Traffic)</h3>
              <Line data={chartData} />
            </div>
          </>
        )}

        {/* ================= EDUKASI ================= */}
        {menu === "edukasi" && <KontenEdukasi />}

        {/* ================= HARGA & ASET ================= */}
        {menu === "harga" && <HargaAsset />}
        {menu === "user" && <User />}

      </div>
    </div>
  );
};

export default DashboardAdmin;
