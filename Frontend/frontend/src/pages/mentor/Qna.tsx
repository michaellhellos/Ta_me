import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { BACKEND_URL, API_URL } from "../../config";
import "./MentorDashboard.css";

const socket = io(BACKEND_URL);

interface Participant {
  _id: string;
  name: string;
  role: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: string;
  lastMessageAt?: string;
}

const Qna: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();
  const token = React.useMemo(() => localStorage.getItem("token"), []);

  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  /* =========================
     FETCH CONVERSATIONS
  ========================= */
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_URL}/chat/conversation`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setConversations(res.data.data);
      } else {
        setError("Gagal mengambil data percakapan.");
      }
    } catch (err) {
      console.error("FETCH CONVERSATION ERROR:", err);
      setError("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     REALTIME SOCKET EFFECT
  ========================= */
  useEffect(() => {
    if (!token) return;

    fetchConversations();

    socket.on("receive_message", (data) => {
      setConversations((prev) => {
        const convExists = prev.find((c) => c._id === data.conversationId);
        
        if (!convExists) {
          // If it's a completely new chat, refetch the whole list to show it
          fetchConversations();
          return prev;
        }

        return prev.map((conv) =>
          conv._id === data.conversationId
            ? {
              ...conv,
              lastMessage: data.text,
              lastMessageAt: new Date().toISOString()
            }
            : conv
        );
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, [token]);

  const handleOpenChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleContactAdmin = async () => {
    try {
      setLoading(true);
      // 1. Get Admin _id
      const adminRes = await axios.get(`${API_URL}/auth/user?role=admin`);
      if (adminRes.data.success && adminRes.data.data.length > 0) {
        const adminId = adminRes.data.data[0]._id;
        
        // 2. Create/Get chat conversation
        const convRes = await axios.post(
          `${API_URL}/chat/conversation`,
          { receiverId: adminId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (convRes.data.success) {
          navigate(`/chat/${convRes.data.data._id}`);
        }
      } else {
        setError("Gagal menghubungi admin: akun admin tidak ditemukan.");
      }
    } catch (err) {
      console.error("CONTACT ADMIN ERROR:", err);
      setError("Gagal menghubungi admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qna-container">

      {/* TITLE */}
      <div className="qna-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2>Inbox Chat Siswa</h2>
          <span className="qna-badge">Total {conversations.length}</span>
        </div>
        <button 
          onClick={handleContactAdmin}
          style={{
            background: "linear-gradient(135deg, #a855f7, #c084fc)",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "20px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "13px",
            boxShadow: "0 4px 14px rgba(168, 85, 247, 0.3)",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "none"}
        >
          🎧 Hubungi Admin Support
        </button>
      </div>

      {loading && (
        <div className="qna-loading">Loading percakapan...</div>
      )}

      {error && (
        <div className="qna-error">{error}</div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="qna-empty">Belum ada percakapan masuk.</div>
      )}

      {/* LIST CONVERSATION */}
      {!loading &&
        conversations.map((conv) => {
          const student = conv.participants.find(
            (p) => p._id !== user?.id && p._id !== user?._id
          );

          return (
            <div key={conv._id} className="qna-card">
              <div className="qna-card-top">
                <div>
                  <span className="qna-name">
                    {student?.name || "User"}
                  </span>
                  <span className="qna-time">
                    {conv.lastMessageAt
                      ? new Date(conv.lastMessageAt).toLocaleString()
                      : "Belum ada pesan"}
                  </span>
                </div>

                <button
                  className="qna-btn"
                  onClick={() => handleOpenChat(conv._id)}
                >
                  BALAS 💬
                </button>
              </div>

              <div className="qna-preview">
                {conv.lastMessage || "Mulai percakapan..."}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Qna;