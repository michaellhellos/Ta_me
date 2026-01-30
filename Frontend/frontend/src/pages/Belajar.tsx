import { useState } from "react";
import "./Belajar.css";

const Belajar = () => {
  const [tab, setTab] = useState<"materi" | "mentoring">("materi");

  return (
    <div className="belajar">
      {/* HERO */}
      <section className="belajar-hero">
        <div>
          <h2>Akademi Kripto 🎓</h2>
          <p>Belajar trading seru & interaktif!</p>
        </div>
        <div className="xp-box">
          <span>TOTAL XP</span>
          <strong>0</strong>
        </div>
      </section>

      {/* TAB */}
      <div className="belajar-tab">
        <button
          className={tab === "materi" ? "active" : ""}
          onClick={() => setTab("materi")}
        >
          📘 Materi & Kuis
        </button>
        <button
          className={tab === "mentoring" ? "active" : ""}
          onClick={() => setTab("mentoring")}
        >
          🗓 Jadwal Mentoring
        </button>
      </div>

      {/* CONTENT */}
      {tab === "materi" && (
        <div className="belajar-list">
          <div className="belajar-card">
            <h4>🤔 Apa itu Cryptocurrency?</h4>
            <p>Kenalan sama uang digital yang lagi hits.</p>
            <span className="progress">0 / 2 Soal</span>
          </div>

          <div className="belajar-card">
            <h4>🔗 Blockchain 101</h4>
            <p>Teknologi di balik kripto yang super aman.</p>
            <span className="progress">0 / 1 Soal</span>
          </div>

          <div className="belajar-card">
            <h4>📊 Membaca Grafik (Chart)</h4>
            <p>Belajar candlestick biar gak salah entry.</p>
            <span className="progress">0 / 1 Soal</span>
          </div>
        </div>
      )}

      {tab === "mentoring" && (
        <div className="belajar-list">
          <div className="belajar-card live">
            <span className="badge">LIVE • Hari Ini 19:00 WIB</span>
            <h4>Live Trading: Cari Sinyal Cuan</h4>
            <p>Coach Kevin • Pro Trader</p>
            <button className="join">Join Sekarang</button>
          </div>

          <div className="belajar-card upcoming">
            <span className="badge upcoming">BESOK 20:00 WIB</span>
            <h4>Psikologi Trading untuk Pemula</h4>
            <p>Kak Sarah • Financial Psych</p>
            <button className="ingat">Ingatkan Saya 🔔</button>
          </div>

          <p className="info">
            Jadwal mentoring diperbarui setiap Minggu pukul 18:00 WIB
          </p>
        </div>
      )}
    </div>
  );
};

export default Belajar;
