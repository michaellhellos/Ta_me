import React, { useState } from "react";
import axios from "axios";
import "./MentorDashboard.css";

const Createforum: React.FC = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Isi broadcast tidak boleh kosong!");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/community/create",
        {
          content,
          image: null,
          file: null,
          link: null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Broadcast berhasil dikirim 🚀");
      console.log("Response:", response.data);

      setContent("");

    } catch (error: any) {
      console.error("ERROR CREATE POST:", error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Terjadi kesalahan server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-container">

      <div className="forum-header">
        <h1>Broadcast Komunitas 📢</h1>
        <p>
          Bagikan sinyal trading, tips psikologi, atau sekadar menyapa para trader Gen Z.
        </p>
      </div>

      <div className="forum-card">

        <div className="forum-user">
          <div className="avatar">👨‍🏫</div>
          <div>
            <h4>Post sebagai Mentor</h4>
            <span>Postingan akan terlihat di community forum</span>
          </div>
        </div>

        <textarea
          placeholder="Ketik pengumuman atau sinyal cuanmu di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="forum-actions">
          <div className="left-icons">
            <button type="button">🖼️</button>
            <button type="button">📊</button>
            <button type="button">🔗</button>
          </div>

          <button
            className="broadcast-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Mengirim..." : "BROADCAST SEKARANG 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Createforum;