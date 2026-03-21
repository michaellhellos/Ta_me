import React, { useEffect, useState, useRef, Fragment, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import "./Chat.css";

const socket = io("http://localhost:5000");

/* ── Types ── */
type Message = {
  _id?: string;
  text: string;
  sender: {
    _id: string;
    name: string;
    role?: string;
  };
  isRead?: boolean;
  createdAt?: string;
};

type ChatPartner = {
  _id: string;
  name: string;
  role: string;
};

/* ── Avatar helper ── */
const avatarGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #06b6d4, #38bdf8)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
];

const getAvatarGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

/* ── Date helpers ── */
const isSameDay = (d1: string, d2: string) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isToday = (dateStr: string) => {
  return isSameDay(dateStr, new Date().toISOString());
};

const isYesterday = (dateStr: string) => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isSameDay(dateStr, d.toISOString());
};

const formatDateLabel = (dateStr: string) => {
  if (isToday(dateStr)) return "Hari ini";
  if (isYesterday(dateStr)) return "Kemarin";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const shouldShowDate = (msg: Message, prev: Message | null) => {
  if (!msg.createdAt) return false;
  if (!prev || !prev.createdAt) return true;
  return !isSameDay(msg.createdAt, prev.createdAt);
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ================= COMPONENT ================= */
const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token = React.useMemo(() => localStorage.getItem("token"), []);
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const myId = React.useMemo(() => user?.id || user?._id, [user]);

  /* ── Auto-scroll ── */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping, scrollToBottom]);

  /* ── Fetch conversation info (partner name + role) ── */
  useEffect(() => {
    if (!conversationId || !token) return;

    axios
      .get("http://localhost:5000/api/chat/conversation", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          const conv = res.data.data.find(
            (c: any) => c._id === conversationId
          );
          if (conv?.participants) {
            const partner = conv.participants.find(
              (p: any) => p._id !== myId
            );
            if (partner) {
              setChatPartner({
                _id: partner._id,
                name: partner.name,
                role: partner.role || "user",
              });
            }
          }
        }
      })
      .catch(() => { });
  }, [conversationId]);

  /* ── Socket + fetch messages + mark read ── */
  useEffect(() => {
    if (!conversationId) return;

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/message/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error("FETCH MESSAGES ERROR:", err);
      }
    };

    // Mark all incoming unread as read
    const markAllRead = async () => {
      try {
        await axios.put(
          `http://localhost:5000/api/chat/mark-read/${conversationId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("MARK READ ERROR:", err);
      }
    };

    fetchMessages();
    markAllRead();

    // Join socket room
    socket.emit("join_conversation", conversationId);

    // Receive message (sender excluded via socket.to on server)
    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);

      // Auto-mark as read (chat is open)
      if (data._id) {
        socket.emit("message_read", {
          conversationId,
          messageId: data._id,
        });
      }
    });

    // Read receipt update
    socket.on("message_read_update", (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, isRead: true } : msg
        )
      );
    });

    // Typing indicators
    socket.on("user_typing", () => setIsPartnerTyping(true));
    socket.on("user_stop_typing", () => setIsPartnerTyping(false));

    return () => {
      socket.off("receive_message");
      socket.off("message_read_update");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [conversationId]);

  /* ── Send message ── */
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chat/message",
        { conversationId, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessage = res.data.data;

      socket.emit("send_message", {
        ...newMessage,
        conversationId,
      });

      // Stop typing
      socket.emit("stop_typing", { conversationId, userId: myId });

      setMessages((prev) => [...prev, newMessage]);
      setText("");
    } catch (err) {
      console.error("SEND ERROR:", err);
    }
  };

  /* ── Typing handler ── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    socket.emit("typing", { conversationId, userId: myId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId, userId: myId });
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const partnerInitial = chatPartner
    ? chatPartner.name.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="wa-chat-page">
      {/* ── HEADER ── */}
      <div className="wa-header">
        <button className="wa-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>

        <div
          className="wa-header-avatar"
          style={{
            background: chatPartner
              ? getAvatarGradient(chatPartner.name)
              : "#334155",
          }}
        >
          {partnerInitial}
        </div>

        <div className="wa-header-info">
          <h3>{chatPartner?.name || "Chat"}</h3>
          {isPartnerTyping ? (
            <span className="wa-typing-text">sedang mengetik...</span>
          ) : (
            <span className="wa-subtitle">{chatPartner?.role || ""}</span>
          )}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="wa-messages">
        {/* Empty state */}
        {messages.length === 0 && !isPartnerTyping && (
          <div className="wa-empty">
            <MessageCircle size={48} />
            <h3>Mulai Percakapan!</h3>
            <p>Kirim pesan pertamamu 💬</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const prev = idx > 0 ? messages[idx - 1] : null;
          const isMe =
            msg.sender._id === myId ||
            (msg.sender as any) === myId;
          const showDate = shouldShowDate(msg, prev);
          const isFirst =
            !prev ||
            prev.sender._id !== msg.sender._id ||
            showDate;

          return (
            <Fragment key={msg._id || idx}>
              {showDate && msg.createdAt && (
                <div className="wa-date-pill">
                  <span>{formatDateLabel(msg.createdAt)}</span>
                </div>
              )}

              <div
                className={`wa-msg ${isMe ? "me" : "other"} ${isFirst ? "first" : ""}`}
              >
                <div className="wa-bubble">
                  <p>{msg.text}</p>
                  <span className="wa-meta">
                    <span className="wa-time">
                      {formatTime(msg.createdAt)}
                    </span>
                    {isMe && (
                      <span
                        className={`wa-check ${msg.isRead ? "read" : ""}`}
                      >
                        {msg.isRead ? "✔✔" : "✔"}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Fragment>
          );
        })}

        {/* Typing indicator */}
        {isPartnerTyping && (
          <div className="wa-msg other first">
            <div className="wa-bubble wa-typing-bubble">
              <div className="wa-typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT BAR ── */}
      <div className="wa-input-bar">
        <input
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan"
        />
        <button
          className="wa-send"
          onClick={sendMessage}
          disabled={!text.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chat;