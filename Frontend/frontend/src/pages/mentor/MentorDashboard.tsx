import React, { useState, useEffect } from "react";
import "./MentorDashboard.css";
import {
  MessageCircle,
  Users,
  Radio,
  Clock,
  LogOut,
  Trash2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import Qna from "./Qna";
import PantauSiswa from "./PantauSiswa";
import Createforum from "./Createforum";
import MentorForumFeed from "./MentorForumFeed";

type Menu = "live" | "qna" | "siswa" | "broadcast";

interface Schedule {
  _id: string;
  title: string;
  description: string;
  date: string;
  zoomLink: string;
  isPublished: boolean;
  createdAt: string;
}

const avatarGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #06b6d4, #38bdf8)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
];

const getGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const formatScheduleDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatScheduleTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MentorDashboard: React.FC = () => {
  const [menu, setMenu] = useState<Menu>("live");
  const [forumRefreshKey, setForumRefreshKey] = useState(0);
  const handlePostCreated = () => setForumRefreshKey((k) => k + 1);

  const [mentorName, setMentorName] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  // Schedule state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    zoomLink: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Get mentor name from localStorage
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setMentorName(user.name || "Mentor");
    } catch {
      setMentorName("Mentor");
    }

    if (!token) return;

    // Fetch live stats
    Promise.all([
      axios.get("http://localhost:5000/api/trade/mentor/students", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:5000/api/chat/conversation", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([studentsRes, chatsRes]) => {
        setStudentCount(studentsRes.data?.data?.length || 0);
        setChatCount(chatsRes.data?.data?.length || 0);
      })
      .catch((err) => console.error("Stats error:", err));

    // Fetch schedules
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/schedule/mentor",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSchedules(res.data.data || []);
      }
    } catch (err) {
      console.error("FETCH SCHEDULES ERROR:", err);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.time || !form.zoomLink) {
      alert("Semua field wajib diisi (kecuali deskripsi)");
      return;
    }

    try {
      setFormLoading(true);
      const dateTime = new Date(`${form.date}T${form.time}`);

      await axios.post(
        "http://localhost:5000/api/schedule",
        {
          title: form.title,
          description: form.description,
          date: dateTime.toISOString(),
          zoomLink: form.zoomLink,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({ title: "", description: "", date: "", time: "", zoomLink: "" });
      setShowForm(false);
      fetchSchedules();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal membuat jadwal");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus jadwal ini?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSchedules();
    } catch (err) {
      console.error("DELETE SCHEDULE ERROR:", err);
    }
  };

  const initial = mentorName ? mentorName.charAt(0).toUpperCase() : "M";
  const upcomingCount = schedules.filter(
    (s) => new Date(s.date) >= new Date()
  ).length;

  return (
    <div className="mentor-dashboard">
      {/* HEADER */}
      <div className="topbar">
        <div className="profile">
          <div
            className="avatar"
            style={{ background: getGradient(mentorName || "Mentor") }}
          >
            {initial}
          </div>
          <div>
            <h3>{mentorName}</h3>
            <span className="subtitle">MENTOR DASHBOARD</span>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut size={16} />
          LOGOUT
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="nav-tabs">
        <div
          className={menu === "live" ? "tab active" : "tab"}
          onClick={() => setMenu("live")}
        >
          <Radio size={16} /> SESI LIVE
        </div>

        <div
          className={menu === "qna" ? "tab active" : "tab"}
          onClick={() => setMenu("qna")}
        >
          <MessageCircle size={16} /> INBOX Q&A
          {chatCount > 0 && <span className="badge">{chatCount}</span>}
        </div>

        <div
          className={menu === "siswa" ? "tab active" : "tab"}
          onClick={() => setMenu("siswa")}
        >
          <Users size={16} /> PANTAU SISWA
        </div>

        <div
          className={menu === "broadcast" ? "tab active" : "tab"}
          onClick={() => setMenu("broadcast")}
        >
          <MessageCircle size={16} /> FORUM BROADCAST
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      {menu === "live" && (
        <>
          {/* STATS */}
          <div className="stats">
            <div className="stat-card">
              <Users size={22} />
              <div>
                <p>Total Siswa</p>
                <h2>{studentCount}</h2>
              </div>
            </div>

            <div className="stat-card">
              <MessageCircle size={22} />
              <div>
                <p>Inbox Chat</p>
                <h2>{chatCount}</h2>
              </div>
            </div>

            <div className="stat-card">
              <Calendar size={22} />
              <div>
                <p>Jadwal Aktif</p>
                <h2>{upcomingCount}</h2>
              </div>
            </div>

            <div className="stat-card">
              <Clock size={22} />
              <div>
                <p>Total Sesi</p>
                <h2>{schedules.length}</h2>
              </div>
            </div>
          </div>

          {/* SECTION JADWAL */}
          <div className="content-section">
            <div className="content-header">
              <h2>Jadwal Mentoring Kamu</h2>
              <button
                className="new-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "✕ Batal" : "+ Buat Jadwal Baru"}
              </button>
            </div>

            {/* FORM */}
            {showForm && (
              <div className="schedule-form">
                <input
                  type="text"
                  name="title"
                  placeholder="Judul Sesi (contoh: Analisis Teknikal BTC)"
                  value={form.title}
                  onChange={handleFormChange}
                />

                <textarea
                  name="description"
                  placeholder="Deskripsi singkat (opsional)"
                  value={form.description}
                  onChange={handleFormChange}
                />

                <div className="form-row">
                  <div className="form-group">
                    <label>Tanggal</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Waktu</label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <input
                  type="url"
                  name="zoomLink"
                  placeholder="Link Zoom Meeting"
                  value={form.zoomLink}
                  onChange={handleFormChange}
                />

                <button
                  className="publish-btn"
                  onClick={handleSubmit}
                  disabled={formLoading}
                >
                  {formLoading ? "Publishing..." : "PUBLISH JADWAL 🚀"}
                </button>
              </div>
            )}

            {/* LIST */}
            {schedules.length === 0 ? (
              <div className="empty-box">
                Kamu belum memiliki jadwal mentoring.
              </div>
            ) : (
              <div className="schedule-list">
                {schedules.map((sch) => {
                  const isPast = new Date(sch.date) < new Date();
                  return (
                    <div
                      key={sch._id}
                      className={`schedule-item ${isPast ? "past" : ""}`}
                    >
                      <div className="schedule-item-left">
                        <div className="schedule-date-badge">
                          <span className="sch-day">
                            {new Date(sch.date).getDate()}
                          </span>
                          <span className="sch-month">
                            {new Date(sch.date).toLocaleDateString("id-ID", {
                              month: "short",
                            })}
                          </span>
                        </div>

                        <div className="schedule-item-info">
                          <strong>{sch.title}</strong>
                          {sch.description && (
                            <p className="sch-desc">{sch.description}</p>
                          )}
                          <div className="sch-meta">
                            <Clock size={13} />
                            <span>
                              {formatScheduleDate(sch.date)} •{" "}
                              {formatScheduleTime(sch.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="schedule-item-actions">
                        <a
                          href={sch.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="zoom-link"
                        >
                          <ExternalLink size={14} />
                          Zoom
                        </a>

                        <button
                          className="delete-sch-btn"
                          onClick={() => handleDelete(sch._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
