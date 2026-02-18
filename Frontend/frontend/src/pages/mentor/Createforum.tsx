import React, { useState } from "react";
import "./MentorDashboard.css";

const Createforum: React.FC = () => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("Isi broadcast tidak boleh kosong!");
      return;
    }

    // nanti bisa diganti API call ke backend
    console.log("Broadcast:", content);
    alert("Broadcast berhasil dikirim 🚀");
    setContent("");
  };

  return (
    <div className="forum-container">

      {/* TITLE */}
      <div className="forum-header">
        <h1>Broadcast Komunitas 📢</h1>
        <p>
          Bagikan sinyal trading, tips psikologi, atau sekadar menyapa para trader Gen Z.
        </p>
      </div>

      {/* CARD */}
      <div className="forum-card">

        <div className="forum-user">
          <div className="avatar">👨‍🏫</div>
          <div>
            <h4>Post sebagai michaell</h4>
            <span>Postingan akan terlihat di community forum</span>
          </div>
        </div>

        {/* TEXTAREA */}
        <textarea
          placeholder="Ketik pengumuman atau sinyal cuanmu di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* ACTIONS */}
        <div className="forum-actions">
          <div className="left-icons">
            <button>🖼️</button>
            <button>📊</button>
            <button>🔗</button>
          </div>

          <button className="broadcast-btn" onClick={handleSubmit}>
            BROADCAST SEKARANG 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default Createforum;
