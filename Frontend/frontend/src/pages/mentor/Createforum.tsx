import React, { useState, useRef } from "react";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import EmojiPicker from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import "./MentorDashboard.css";
import "./Createforum.css";

const API = "http://localhost:5000/api/community";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"]
  ]
};

const QUILL_FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list",
  "blockquote", "code-block",
  "link", "image"
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/zip"
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface Attachment {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: "image" | "file";
}

interface CreateforumProps {
  onPostCreated?: () => void;
}

const Createforum: React.FC<CreateforumProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const quillRef = useRef<ReactQuill>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const getToken = () => localStorage.getItem("token") || "";

  /* ── Image Upload ── */
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("Hanya gambar (JPEG, PNG, GIF, WebP) yang diizinkan");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(`${API}/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const data: Attachment = {
        url: res.data.url,
        originalName: res.data.originalName,
        mimeType: res.data.mimeType,
        size: res.data.size,
        type: "image"
      };

      // Insert into Quill editor
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", `http://localhost:5000${data.url}`);
        quill.setSelection(range.index + 1, 0);
      }

      setAttachments(prev => [...prev, data]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  /* ── File Upload ── */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert("Tipe file tidak didukung. Gunakan: PDF, DOC, DOCX, TXT, ZIP");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran file maksimal 10MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API}/upload/file`, formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const data: Attachment = {
        url: res.data.url,
        originalName: res.data.originalName,
        mimeType: res.data.mimeType,
        size: res.data.size,
        type: "file"
      };

      setAttachments(prev => [...prev, data]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── Remove Attachment ── */
  const removeAttachment = async (index: number) => {
    const att = attachments[index];
    try {
      const filename = att.url.split("/").pop();
      await axios.delete(`${API}/upload/${filename}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } catch {
      // ignore delete error, still remove from UI
    }
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  /* ── Emoji ── */
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, emojiData.emoji);
      quill.setSelection(range.index + emojiData.emoji.length, 0);
    }
    setShowEmoji(false);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const textOnly = content.replace(/<[^>]*>/g, "").trim();
    if (!textOnly) {
      alert("Isi broadcast tidak boleh kosong!");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/create`,
        { content, attachments },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      alert("Broadcast berhasil dikirim 🚀");
      setContent("");
      setAttachments([]);
      onPostCreated?.();
    } catch (err: any) {
      alert(err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Broadcast Komunitas 📢</h1>
        <p>Bagikan sinyal trading, tips psikologi, atau sekadar menyapa para trader Gen Z.</p>
      </div>

      <div className="forum-card">
        <div className="forum-user">
          <div className="avatar">👨‍🏫</div>
          <div>
            <h4>Post sebagai Mentor</h4>
            <span>Postingan akan terlihat di community forum</span>
          </div>
        </div>

        {/* WYSIWYG Editor */}
        <div className="quill-wrapper">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            placeholder="Ketik pengumuman atau sinyal cuanmu di sini..."
          />
        </div>

        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="attachment-list">
            {attachments.map((att, i) => (
              <div key={i} className={`attachment-chip ${att.type}`}>
                <span className="att-icon">
                  {att.type === "image" ? "🖼️" : "📄"}
                </span>
                <span className="att-name" title={att.originalName}>
                  {att.originalName.length > 25
                    ? att.originalName.slice(0, 22) + "..."
                    : att.originalName}
                </span>
                <span className="att-size">{formatSize(att.size)}</span>
                <button
                  className="att-remove"
                  onClick={() => removeAttachment(i)}
                  title="Hapus"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="forum-actions">
          <div className="left-icons">
            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              ref={imageInputRef}
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.zip"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              title="Upload Gambar"
            >
              📷
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Upload File"
            >
              📎
            </button>

            <div className="emoji-wrapper" ref={emojiRef}>
              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                title="Emoji"
              >
                😊
              </button>
              {showEmoji && (
                <div className="emoji-picker-container">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={320}
                    height={400}
                    searchDisabled={false}
                    lazyLoadEmojis={true}
                  />
                </div>
              )}
            </div>
          </div>

          <button
            className="broadcast-btn"
            onClick={handleSubmit}
            disabled={loading || uploading}
          >
            {loading ? "Mengirim..." : uploading ? "Uploading..." : "BROADCAST SEKARANG 🚀"}
          </button>
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="upload-bar" />
            <span>Mengupload file...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Createforum;