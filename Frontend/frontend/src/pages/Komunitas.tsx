import { useState } from "react";
import "./Komunitas.css";

const Komunitas = () => {
  const [tab, setTab] = useState<"leaderboard" | "forum">("leaderboard");

  return (
    <div className="komunitas">
      {/* HERO */}
      <section className="komunitas-hero">
        <div>
          <h2>Komunitas Trader 🌍</h2>
          <p>Bersaing di Leaderboard & Diskusi Strategi!</p>
        </div>
      </section>

      {/* TAB */}
      <div className="komunitas-tab">
        <button
          className={tab === "leaderboard" ? "active" : ""}
          onClick={() => setTab("leaderboard")}
        >
          🏆 Leaderboard
        </button>
        <button
          className={tab === "forum" ? "active" : ""}
          onClick={() => setTab("forum")}
        >
          💬 Forum Diskusi
        </button>
      </div>

      {/* CONTENT */}
      {tab === "leaderboard" && (
        <div className="leaderboard-card">
          <div className="leaderboard-header">
            <span>RANK</span>
            <span>TRADER</span>
            <span>PROFIT (%)</span>
            <span>TOTAL ASET</span>
          </div>

          <div className="leaderboard-row">
            <span>🥇</span>
            <strong>CryptoMaster</strong>
            <span className="green">+1,240%</span>
            <span>$124,500</span>
          </div>

          <div className="leaderboard-row">
            <span>🥈</span>
            <strong>SatoshiFan</strong>
            <span className="green">+890%</span>
            <span>$98,200</span>
          </div>

          <div className="leaderboard-row">
            <span>🥉</span>
            <strong>MoonWalker</strong>
            <span className="green">+450%</span>
            <span>$54,100</span>
          </div>

          <div className="leaderboard-row highlight">
            <span>#4</span>
            <strong>memegunawan@gmail.com</strong>
            <span className="green">+12%</span>
            <span>$11,200</span>
          </div>

          <div className="leaderboard-row">
            <span>#5</span>
            <strong>HODL_Gang</strong>
            <span className="red">-5%</span>
            <span>$9,500</span>
          </div>
        </div>
      )}

      {tab === "forum" && (
        <div className="forum-placeholder">
          <h3>💬 Forum Diskusi</h3>
          <p>Fitur forum diskusi akan segera hadir 🚀</p>
        </div>
      )}
    </div>
  );
};

export default Komunitas;
