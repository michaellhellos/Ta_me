import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MentorDashboard.css";

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

  // Safe parsing user
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchConversations();
  }, [token]);

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

  const handleOpenChat = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold">{user?.name || "Mentor"}</h1>
          <p className="text-sm text-green-400">MENTOR DASHBOARD</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto mt-8 px-4">

        {/* TITLE */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-semibold">
            Inbox Chat Siswa
          </h2>
          <span className="bg-gray-700 text-sm px-3 py-1 rounded-full">
            Total {conversations.length}
          </span>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-400">
            Loading percakapan...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="text-center text-red-400">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && conversations.length === 0 && (
          <div className="text-center text-gray-500">
            Belum ada percakapan masuk.
          </div>
        )}

        {/* LIST CONVERSATION */}
        <div className="space-y-6">
          {!loading &&
            conversations.map((conv) => {
              const student = conv.participants.find(
                (p) => p._id !== user?._id
              );

              return (
                <div
                  key={conv._id}
                  className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700 hover:border-green-500 transition"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {student?.name || "User"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleString()
                          : "Belum ada pesan"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenChat(conv._id)}
                      className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-sm font-medium transition duration-200"
                    >
                      BALAS 💬
                    </button>
                  </div>

                  <div className="bg-[#0f172a] p-4 rounded-lg text-gray-300 text-sm">
                    {conv.lastMessage || "Mulai percakapan..."}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Qna;