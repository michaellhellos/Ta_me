import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { ArrowLeft, Send } from "lucide-react";
import "./Chat.css";

const socket = io("http://localhost:5000");

type Message = {
  _id?: string;
  text: string;
  sender: {
    _id: string;
    name: string;
  };
  status?: "sent" | "read";
};

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    socket.emit("join_conversation", conversationId);

    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("message_read_update", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, status: "read" }
            : msg
        )
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_read_update");
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/message/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

      setMessages((prev) => [...prev, newMessage]);
      setText("");
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = (messageId: string) => {
    socket.emit("message_read", {
      conversationId,
      messageId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h2>Chat Room</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => {
          const isMe = msg.sender._id === user._id;

          return (
            <div
              key={msg._id}
              className={`msg-wrapper ${isMe ? "me" : "other"}`}
              onClick={() => !isMe && msg._id && markAsRead(msg._id)}
            >
              <div className="msg-bubble">
                <p>{msg.text}</p>

                {isMe && (
                  <div className="msg-status">
                    {msg.status === "read" ? (
                      <span className="read">✔✔</span>
                    ) : (
                      <span>✔</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan..."
        />
        <button className="chat-send-btn" onClick={sendMessage}>
          <Send />
        </button>
      </div>
    </div>
  );
};

export default Chat;