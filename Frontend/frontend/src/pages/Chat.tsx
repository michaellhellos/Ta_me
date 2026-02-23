import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    // Join room
    socket.emit("join_conversation", conversationId);

    // Receive message realtime
    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Update read status
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
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
        {
          conversationId,
          text
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newMessage = res.data.data;

      // Emit realtime
      socket.emit("send_message", {
        ...newMessage,
        conversationId
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
      messageId
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white p-4">
      
      <h2 className="text-xl font-bold mb-4">Chat Room</h2>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg) => {
          const isMe = msg.sender._id === user._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              onClick={() => !isMe && msg._id && markAsRead(msg._id)}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  isMe
                    ? "bg-green-500 text-black"
                    : "bg-gray-700"
                }`}
              >
                <p>{msg.text}</p>

                {isMe && (
                  <div className="text-xs text-right mt-1">
                    {msg.status === "read" ? (
                      <span className="text-blue-400">✔✔</span>
                    ) : (
                      <span className="text-gray-300">✔</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 rounded-full bg-gray-800 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
        />
        <button
          className="bg-green-500 px-6 rounded-full font-semibold hover:bg-green-600"
          onClick={sendMessage}
        >
          Kirim
        </button>
      </div>
    </div>
  );
};

export default Chat;