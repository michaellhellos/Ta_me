import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MessageCircle, UserX, Calendar } from "lucide-react";
import "./Ai.css";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

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

const Ai = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/user?role=mentor"
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
    fetchMentors();
  }, []);

  const handleSelectMentor = async (mentorId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/chat/conversation",
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

      {loading ? (
        <div className="mentor-skeleton">
          {[1, 2, 3].map((i) => (
            <div className="skeleton-card" key={i}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text-lg" />
                  <div className="skeleton skeleton-text-sm" style={{ marginTop: 8 }} />
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