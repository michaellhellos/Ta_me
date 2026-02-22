import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Ai.css";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
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
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        const conversationId = res.data.data._id;

        // redirect ke halaman chat
        navigate(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error("CREATE CONVERSATION ERROR:", error);
    }
  };

  return (
    <div className="ai">
      <div className="ai-header">
        <h2>Pilih Mentor Kamu</h2>
      </div>

      <div className="mentor-grid">
        {loading ? (
          <p>Loading mentor...</p>
        ) : mentors.length === 0 ? (
          <p>Tidak ada mentor ditemukan</p>
        ) : (
          mentors.map((mentor) => (
            <div className="mentor-card" key={mentor._id}>
              <h3>{mentor.name}</h3>

              <button
                className="mentor-btn"
                onClick={() => handleSelectMentor(mentor._id)}
              >
                Chat Sekarang 💬
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Ai;