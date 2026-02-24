import { useState, useEffect } from "react";
import axios from "axios";
import "../Komunitas.css";
import "./MentorForumFeed.css";

const API = "http://localhost:5000/api/community";

interface Attachment {
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
    type: "image" | "file";
}

interface CommentData {
    _id: string;
    postId: string;
    author: string;
    authorName: string;
    role: string;
    text: string;
    createdAt: string;
}

interface Post {
    _id: string;
    author: { _id: string; name: string; email: string } | null;
    authorName: string;
    role: string;
    content: string;
    attachments: Attachment[];
    likes: string[];
    totalLikes: number;
    commentsCount: number;
    isPinned: boolean;
    createdAt: string;
}

interface MentorForumFeedProps {
    refreshKey: number;
}

const MentorForumFeed: React.FC<MentorForumFeedProps> = ({ refreshKey }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Comment state
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [commentsData, setCommentsData] = useState<Record<string, CommentData[]>>({});
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
    const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

    const getToken = () => localStorage.getItem("token") || "";
    const getUserId = () => {
        try {
            const u = localStorage.getItem("user");
            return u ? JSON.parse(u).id : "";
        } catch {
            return "";
        }
    };

    /* ── Fetch Posts ── */
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(`${API}/all`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setPosts(Array.isArray(res.data) ? res.data : []);
            } catch (err: any) {
                setError("Gagal memuat forum");
                console.error("FETCH POSTS ERROR:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [refreshKey]);

    /* ── Like Post ── */
    const handleLike = async (postId: string) => {
        try {
            const res = await axios.post(
                `${API}/${postId}/like`,
                {},
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            setPosts(prev =>
                prev.map(p =>
                    p._id === postId
                        ? {
                            ...p, totalLikes: res.data.totalLikes, likes: res.data.liked
                                ? [...p.likes, getUserId()]
                                : p.likes.filter(id => id !== getUserId())
                        }
                        : p
                )
            );
        } catch (err) {
            console.error("LIKE ERROR:", err);
        }
    };

    /* ── Toggle Comments ── */
    const toggleComments = async (postId: string) => {
        const isOpening = !expandedComments[postId];

        setExpandedComments(prev => ({ ...prev, [postId]: isOpening }));

        if (isOpening && !commentsData[postId]) {
            try {
                setLoadingComments(prev => ({ ...prev, [postId]: true }));
                const res = await axios.get(`${API}/${postId}/comments`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setCommentsData(prev => ({
                    ...prev,
                    [postId]: Array.isArray(res.data.data) ? res.data.data : []
                }));
            } catch (err) {
                console.error("FETCH COMMENTS ERROR:", err);
            } finally {
                setLoadingComments(prev => ({ ...prev, [postId]: false }));
            }
        }
    };

    /* ── Submit Comment ── */
    const submitComment = async (postId: string) => {
        const text = (commentInputs[postId] || "").trim();
        if (!text) return;

        try {
            setSubmittingComment(prev => ({ ...prev, [postId]: true }));
            const res = await axios.post(
                `${API}/${postId}/comment`,
                { text },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            setCommentsData(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), res.data.comment]
            }));

            setPosts(prev =>
                prev.map(p =>
                    p._id === postId
                        ? { ...p, commentsCount: p.commentsCount + 1 }
                        : p
                )
            );

            setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        } catch (err: any) {
            alert(err.response?.data?.message || "Gagal mengirim komentar");
        } finally {
            setSubmittingComment(prev => ({ ...prev, [postId]: false }));
        }
    };

    /* ── Format helpers ── */
    const timeAgo = (dateStr: string) => {
        const now = Date.now();
        const then = new Date(dateStr).getTime();
        const diff = now - then;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "baru saja";
        if (mins < 60) return `${mins} menit lalu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} jam lalu`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} hari lalu`;
        return new Date(dateStr).toLocaleDateString("id-ID");
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    const isLiked = (post: Post) => {
        const uid = getUserId();
        return post.likes.some(id => id === uid);
    };

    const getRoleEmoji = (role: string) => {
        if (role === "admin") return "🛡️";
        if (role === "mentor") return "👨‍🏫";
        return "👤";
    };

    return (
        <div className="mentor-forum-feed">
            <div className="mentor-feed-header">
                <h3>📋 Forum Posts</h3>
                {!loading && !error && (
                    <span className="mentor-feed-count">{posts.length} post</span>
                )}
            </div>

            <div className="mentor-feed-list">
                {loading && (
                    <div className="forum-loading">
                        <div className="loading-spinner" />
                        <span>Memuat forum...</span>
                    </div>
                )}

                {error && (
                    <div className="forum-error">
                        <p>⚠️ {error}</p>
                    </div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div className="feed-empty">
                        <div className="feed-empty-icon">📭</div>
                        <h4>Belum ada postingan</h4>
                        <p>Buat broadcast pertamamu menggunakan editor di atas!</p>
                    </div>
                )}

                {posts.map(post => (
                    <div
                        key={post._id}
                        className={`forum-post-card ${post.isPinned ? "pinned" : ""}`}
                    >
                        {post.isPinned && <span className="pin-badge">📌 Pinned</span>}

                        {/* Author */}
                        <div className="post-header">
                            <div className="post-avatar">
                                {getRoleEmoji(post.role)}
                            </div>
                            <div className="post-meta">
                                <strong>{post.authorName}</strong>
                                <span className="post-role">{post.role}</span>
                                <span className="post-time">{timeAgo(post.createdAt)}</span>
                            </div>
                        </div>

                        {/* Rich Content */}
                        <div
                            className="post-content"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Attachments — file downloads only */}
                        {post.attachments && post.attachments.filter(a => a.type === "file").length > 0 && (
                            <div className="post-attachments">
                                {post.attachments
                                    .filter(a => a.type === "file")
                                    .map((att, i) => (
                                        <a
                                            key={i}
                                            className="post-file-link"
                                            href={`http://localhost:5000${att.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            📄 {att.originalName}
                                            <span className="file-size">{formatSize(att.size)}</span>
                                        </a>
                                    ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="post-actions">
                            <button
                                className={`like-btn ${isLiked(post) ? "liked" : ""}`}
                                onClick={() => handleLike(post._id)}
                            >
                                {isLiked(post) ? "❤️" : "🤍"} {post.totalLikes}
                            </button>
                            <button
                                className={`comment-btn ${expandedComments[post._id] ? "active" : ""}`}
                                onClick={() => toggleComments(post._id)}
                            >
                                💬 {post.commentsCount}
                            </button>
                        </div>

                        {/* Comment Section */}
                        {expandedComments[post._id] && (
                            <div className="comment-section">
                                {loadingComments[post._id] && (
                                    <div className="comment-loading">Memuat komentar...</div>
                                )}

                                {commentsData[post._id] && commentsData[post._id].length > 0 && (
                                    <div className="comment-list">
                                        {commentsData[post._id].map(c => (
                                            <div key={c._id} className="comment-item">
                                                <div className="comment-header">
                                                    <span className="comment-avatar">{getRoleEmoji(c.role)}</span>
                                                    <strong className="comment-name">{c.authorName}</strong>
                                                    <span className="comment-role">{c.role}</span>
                                                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                                                </div>
                                                <p className="comment-text">{c.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {commentsData[post._id] && commentsData[post._id].length === 0 && !loadingComments[post._id] && (
                                    <div className="comment-empty">Belum ada komentar. Jadilah yang pertama!</div>
                                )}

                                <div className="comment-input-row">
                                    <input
                                        type="text"
                                        placeholder="Tulis komentar..."
                                        value={commentInputs[post._id] || ""}
                                        onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                        onKeyDown={e => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                submitComment(post._id);
                                            }
                                        }}
                                        maxLength={1000}
                                        disabled={submittingComment[post._id]}
                                    />
                                    <button
                                        className="comment-submit-btn"
                                        onClick={() => submitComment(post._id)}
                                        disabled={submittingComment[post._id] || !(commentInputs[post._id] || "").trim()}
                                    >
                                        {submittingComment[post._id] ? "..." : "Kirim"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MentorForumFeed;
