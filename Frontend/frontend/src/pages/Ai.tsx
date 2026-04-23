import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MessageCircle, UserX, Calendar, Clock, ExternalLink } from "lucide-react";
import { API_URL } from "../config";
import "./Ai.css";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

interface Schedule {
  _id: string;
  mentorId: {
    _id: string;
    name: string;
    specialization?: string;
  };
  title: string;
  description: string;
  date: string;
  zoomLink: string;
}

// Deterministic avatar color from name
const avatarGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #14b8a6, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #22c55e, #10b981)",
  "linear-gradient(135deg, #38bdf8, #6366f1)",
];

const getAvatarGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
};

const formatScheduleDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatScheduleTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Ai = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/auth/user?role=mentor`
        );
        if (res.data.success) {
          setMentors(res.data.data);
        }
      } catch (error) {
        console.error("FETCH MENTOR ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSchedules = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/schedule/upcoming`
        );
        if (res.data.success) {
          setSchedules(res.data.data || []);
        }
      } catch (error) {
        console.error("FETCH SCHEDULES ERROR:", error);
      }
    };

    fetchMentors();
    fetchSchedules();
  }, []);

  const handleSelectMentor = async (mentorId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/chat/conversation`,
        { receiverId: mentorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        navigate(`/chat/${res.data.data._id}`);
      }
    } catch (error) {
      console.error("CREATE CONVERSATION ERROR:", error);
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <h2>Pilih Mentor Kamu</h2>
        <p>Konsultasi langsung dengan mentor berpengalaman</p>
      </div>

      {/* ================= UPCOMING SCHEDULES ================= */}
      {schedules.length > 0 && (
        <section className="schedule-section">
          <div className="schedule-section-header">
            <Calendar size={18} />
            <h3>Jadwal Mentoring Mendatang</h3>
            <span className="schedule-count">{schedules.length}</span>
          </div>

          <div className="schedule-grid">
            {schedules.map((sch) => (
              <div className="schedule-card" key={sch._id}>
                <div className="schedule-card-top">
                  <div
                    className="schedule-mentor-avatar"
                    style={{
                      background: getAvatarGradient(
                        sch.mentorId?.name || "M"
                      ),
                    }}
                  >
                    {(sch.mentorId?.name || "M").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong className="schedule-card-title">
                      {sch.title}
                    </strong>
                    <p className="schedule-card-mentor">
                      {sch.mentorId?.name || "Mentor"}
                      {sch.mentorId?.specialization &&
                        ` • ${sch.mentorId.specialization}`}
                    </p>
                  </div>
                </div>

                {sch.description && (
                  <p className="schedule-card-desc">{sch.description}</p>
                )}

                <div className="schedule-card-meta">
                  <div className="sch-date-info">
                    <Calendar size={13} />
                    <span>{formatScheduleDate(sch.date)}</span>
                  </div>
                  <div className="sch-date-info">
                    <Clock size={13} />
                    <span>{formatScheduleTime(sch.date)}</span>
                  </div>
                </div>

                <a
                  href={sch.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="join-zoom-btn"
                >
                  <ExternalLink size={14} />
                  Join Zoom Meeting
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= MENTOR LIST ================= */}
      {loading ? (
        <div className="mentor-skeleton">
          {[1, 2, 3].map((i) => (
            <div className="skeleton-card" key={i}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text-lg" />
                  <div
                    className="skeleton skeleton-text-sm"
                    style={{ marginTop: 8 }}
                  />
                </div>
              </div>
              <div className="skeleton skeleton-btn" />
            </div>
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="mentor-empty">
          <UserX />
          <p>Tidak ada mentor yang tersedia saat ini</p>
        </div>
      ) : (
        <div className="mentor-grid">
          {mentors.map((mentor) => (
            <div className="mentor-card" key={mentor._id}>
              <div className="mentor-top">
                <div
                  className="mentor-avatar"
                  style={{ background: getAvatarGradient(mentor.name) }}
                >
                  {mentor.name.charAt(0).toUpperCase()}
                </div>
                <div className="mentor-info">
                  <h3>{mentor.name}</h3>
                  <span className="mentor-role">Mentor</span>
                </div>
              </div>

              <div className="mentor-date">
                <Calendar />
                Bergabung sejak {formatDate(mentor.createdAt)}
              </div>

              <button
                className="mentor-btn"
                onClick={() => handleSelectMentor(mentor._id)}
              >
                <MessageCircle />
                Chat Sekarang
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ai;