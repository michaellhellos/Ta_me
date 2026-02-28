import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./MentorDashboard.css";

const socket = io("http://localhost:5000");

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
  const token = localStorage.getItem("token");

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
        "http://localhost:5000/api/chat/conversation",
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
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === data.conversationId
            ? {
              ...conv,
              lastMessage: data.text,
              lastMessageAt: new Date().toISOString()
            }
            : conv
        )
      );
    });

    return () => {
      socket.off("receive_message");
    };
  }, [token]);

  const handleOpenChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="qna-container">

      {/* TITLE */}
      <div className="qna-title">
        <h2>Inbox Chat Siswa</h2>
        <span className="qna-badge">Total {conversations.length}</span>
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
            (p) => p._id !== user?._id
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