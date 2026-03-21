import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../mentor/MentorDashboard.css"; // Reuse modern Qna styling

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

const AdminInbox: React.FC = () => {
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
      setConversations((prev) => {
        const convExists = prev.find((c) => c._id === data.conversationId);
        
        if (!convExists) {
          // If it's a completely new ticket/chat, refetch the whole list to show it
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
    // Navigate safely across standard Router (matches exactly how User/Mentor works)
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="qna-container">

      {/* TITLE */}
      <div className="qna-title">
        <h2>Pesan Masuk (Bantuan Mentor/Siswa)</h2>
        <span className="qna-badge">Total {conversations.length}</span>
      </div>

      {loading && (
        <div className="qna-loading">Loading percakapan...</div>
      )}

      {error && (
        <div className="qna-error">{error}</div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="qna-empty">Admin belum memiliki pesan masuk.</div>
      )}

      {/* LIST CONVERSATION */}
      {!loading &&
        conversations.map((conv) => {
          const partner = conv.participants.find(
            (p) => p._id !== user?.id && p._id !== user?._id
          );

          return (
            <div key={conv._id} className="qna-card">
              <div className="qna-card-top">
                <div>
                  <span className="qna-name">
                    {partner?.name || "Anonymous User"} <span style={{fontSize: '11px', background: 'rgba(99, 102, 241, 0.2)', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px', color: '#818cf8'}}>{partner?.role && partner.role.toUpperCase()}</span>
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
                  BALAS TIKET 💬
                </button>
              </div>

              <div className="qna-preview" style={{borderLeft: '3px solid #6366f1'}}>
                {conv.lastMessage || "Mulai percakapan..."}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default AdminInbox;
