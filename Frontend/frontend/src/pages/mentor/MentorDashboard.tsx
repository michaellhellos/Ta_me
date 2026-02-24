import React, { useState } from "react";
import "./MentorDashboard.css";
import { MessageCircle, Users, Radio, Clock } from "lucide-react";
import Qna from "./Qna";
import PantauSiswa from "./PantauSiswa";
import Createforum from "./Createforum";
import MentorForumFeed from "./MentorForumFeed";

type Menu = "live" | "qna" | "siswa" | "broadcast";

const MentorDashboard: React.FC = () => {
  const [menu, setMenu] = useState<Menu>("live");
  const [forumRefreshKey, setForumRefreshKey] = useState(0);
  const handlePostCreated = () => setForumRefreshKey(k => k + 1);

  return (
    <div className="mentor-dashboard">

      {/* HEADER */}
      <div className="topbar">
        <div className="profile">
          <div className="avatar">👨‍🏫</div>
          <div>
            <h3>michaell</h3>
            <span className="subtitle">MAKAN BABI SPECIALIST</span>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          LOGOUT
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="nav-tabs">
        <div
          className={menu === "live" ? "tab active" : "tab"}
          onClick={() => setMenu("live")}
        >
          🎥 SESI LIVE
        </div>

        <div
          className={menu === "qna" ? "tab active" : "tab"}
          onClick={() => setMenu("qna")}
        >
          💬 INBOX Q&A <span className="badge">2</span>
        </div>

        <div
          className={menu === "siswa" ? "tab active" : "tab"}
          onClick={() => setMenu("siswa")}
        >
          👥 PANTAU SISWA
        </div>

        <div
          className={menu === "broadcast" ? "tab active" : "tab"}
          onClick={() => setMenu("broadcast")}
        >
          📢 FORUM BROADCAST
        </div>
      </div>

      {/* ================= CONTENT SWITCH ================= */}

      {menu === "live" && (
        <>
          {/* STATS */}
          <div className="stats">
            <div className="stat-card">
              <Users size={22} />
              <div>
                <p>Total Siswa</p>
                <h2>0</h2>
              </div>
            </div>

            <div className="stat-card">
              <MessageCircle size={22} />
              <div>
                <p>Pending Q&A</p>
                <h2>2</h2>
              </div>
            </div>

            <div className="stat-card">
              <Radio size={22} />
              <div>
                <p>Live Now</p>
                <h2>0</h2>
              </div>
            </div>

            <div className="stat-card">
              <Clock size={22} />
              <div>
                <p>Jam Terbang</p>
                <h2>120+ Jam</h2>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="content-header">
              <h2>Jadwal Mentoring Kamu</h2>
              <button className="new-btn">+ Buat Jadwal Baru</button>
            </div>

            <div className="empty-box">
              Kamu belum memiliki jadwal mentoring.
            </div>
          </div>
        </>
      )}

      {menu === "qna" && <Qna />}
      {menu === "siswa" && <PantauSiswa />}
      {menu === "broadcast" && (
        <>
          <Createforum onPostCreated={handlePostCreated} />
          <MentorForumFeed refreshKey={forumRefreshKey} />
        </>
      )}
    </div>
  );
};

export default MentorDashboard;
