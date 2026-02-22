import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type Message = {
  _id: string;
  text: string;
  sender: {
    _id: string;
    name: string;
  };
};

const Chat = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMessages();
  }, []);

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
    try {
      await axios.post(
        "http://localhost:5000/api/chat/message",
        {
          conversationId,
          text
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setText("");
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat Room</h2>

      <div style={{ marginBottom: 20 }}>
        {messages.map((msg) => (
          <div key={msg._id}>
            <strong>{msg.sender.name}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ketik pesan..."
      />
      <button onClick={sendMessage}>Kirim</button>
    </div>
  );
};

export default Chat;