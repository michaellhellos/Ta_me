import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileQuestion,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import Toast from "./Toast";
import "./Belajar.css";

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Materi {
  _id: string;
  title: string;
  summary: string;
  quizzes: Quiz[];
}

interface NilaiRecord {
  materiId: string;
  score: number;
  totalSoal: number;
}

interface Schedule {
  _id: string;
  mentorId: {
    _id: string;
    name: string;
    specialization?: string;
  };
  title: string;
  description: string;
  date: string;
  zoomLink: string;
}

type ToastData = {
  message: string;
  type: "success" | "error" | "info";
} | null;

type BelajarTab = "quiz" | "jadwal";

/* ── Helpers ── */
const avatarGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
  "linear-gradient(135deg, #14b8a6, #06b6d4)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #22c55e, #10b981)",
  "linear-gradient(135deg, #38bdf8, #6366f1)",
];

const getAvatarGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const formatScheduleDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatScheduleTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Belajar = () => {
  const [activeTab, setActiveTab] = useState<BelajarTab>("quiz");
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [xp, setXp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  const [nilaiMap, setNilaiMap] = useState<Record<string, NilaiRecord>>({});
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // Redeem System State
  const [redeemedXp, setRedeemedXp] = useState<number>(0);
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);

  // ── Fetch all data on mount ──
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    // Fetch materi
    setLoading(true);
    fetch("http://localhost:5000/api/materi/materi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMateriList(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Fetch user's XP scores
    const currentUserId = user?._id || user?.id;
    if (currentUserId) {
      fetch(`http://localhost:5000/api/nilai/user/${currentUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const map: Record<string, NilaiRecord> = {};
            data.data.forEach((n: NilaiRecord) => {
              map[n.materiId] = n;
            });
            setNilaiMap(map);
            if (data.redeemedXp) {
              setRedeemedXp(data.redeemedXp);
            }
          }
        })
        .catch((err) => console.error(err));
    }

    // Fetch schedules
    setSchedulesLoading(true);
    fetch("http://localhost:5000/api/schedule/upcoming")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSchedules(data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setSchedulesLoading(false));
  }, []);

  const handleAnswer = (quizIndex: number, optionIndex: number) => {
    if (submitted) return;
    const updatedAnswers = [...answers];
    updatedAnswers[quizIndex] = optionIndex;
    setAnswers(updatedAnswers);
  };

  const handleRedeem = async (amount: number) => {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const user = JSON.parse(userData);
    const redeemUserId = user._id || user.id;

    setIsRedeeming(true);
    try {
      const response = await fetch("http://localhost:5000/api/nilai/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: redeemUserId, amountXp: amount }),
      });
      const data = await response.json();
      if (data.success) {
        setRedeemedXp(data.redeemedXp);
        setToast({ message: data.message, type: "success" });
        setShowRedeemModal(false);
      } else {
        setToast({ message: data.message, type: "error" });
      }
    } catch (err) {
      setToast({ message: "Gagal menghubungkan ke server", type: "error" });
    } finally {
      setIsRedeeming(false);
    }
  };

  const submitQuiz = async () => {
    if (!selectedMateri) return;

    const totalSoal = selectedMateri.quizzes.length;
    const answeredCount = answers.filter((a) => a !== undefined).length;

    if (answeredCount < totalSoal) {
      setToast({
        message: `Jawab semua soal terlebih dahulu! (${answeredCount}/${totalSoal})`,
        type: "error",
      });
      return;
    }

    let correctCount = 0;
    selectedMateri.quizzes.forEach((quiz, index) => {
      if (answers[index] === quiz.correctAnswer) correctCount++;
    });

    const maxXp = 10;
    const calculatedXp = Math.round((correctCount / totalSoal) * maxXp);
    setXp(calculatedXp);
    setSubmitted(true);

    const userData = localStorage.getItem("user");
    if (!userData) {
      setToast({ message: "User belum login!", type: "error" });
      return;
    }

    const parsedUser = JSON.parse(userData);
    const userId = parsedUser._id || parsedUser.id;

    if (!userId) {
      setToast({ message: "Sesi tidak valid, harap login ulang", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:5000/api/nilai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          materiId: selectedMateri._id,
          score: calculatedXp,
          totalSoal,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setToast({ message: data.message || "Gagal menyimpan nilai", type: "error" });
        return;
      }

      // Update nilaiMap so badge shows immediately
      setNilaiMap((prev) => ({
        ...prev,
        [selectedMateri._id]: {
          materiId: selectedMateri._id,
          score: calculatedXp,
          totalSoal,
        },
      }));

      setToast({
        message: `Nilai berhasil disimpan! ${correctCount}/${totalSoal} benar 🎉`,
        type: "success",
      });
    } catch {
      setToast({ message: "Server error, coba lagi nanti", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = selectedMateri
    ? answers.filter((a) => a !== undefined).length
    : 0;
  const totalCount = selectedMateri?.quizzes.length || 0;

  // Derived state to separate completed and pending quizzes
  const completedMateri = materiList.filter((m) => nilaiMap[m._id]);
  const pendingMateri = materiList.filter((m) => !nilaiMap[m._id]);

  // Total XP accumulated
  const totalEarnedXp = Object.values(nilaiMap).reduce((sum, n) => sum + n.score, 0);
  const availableXp = totalEarnedXp - redeemedXp;

  return (
    <div className="belajar-page">
      {/* =============== REDEEM MODAL =============== */}
      {showRedeemModal && (
        <div className="redeem-modal-overlay">
          <div className="redeem-modal-box">
            <h3>Tukar XP dengan Uang! 💸</h3>
            <p>Pilih paket redeem di bawah untuk mengisi saldo balance Anda.</p>
            
            <div className="redeem-options">
              <button 
                onClick={() => handleRedeem(40)} 
                disabled={availableXp < 40 || isRedeeming}
              >
                🎁 Tukar 40 XP → $5,000
              </button>
              <button 
                onClick={() => handleRedeem(80)} 
                disabled={availableXp < 80 || isRedeeming}
              >
                💎 Tukar 80 XP → $12,000
              </button>
            </div>

            <button className="close-modal-btn" onClick={() => setShowRedeemModal(false)} disabled={isRedeeming}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="belajar-header">
        <h2>Akademi Kripto 🎓</h2>
        <p>Belajar trading seru & interaktif!</p>
      </div>

      {/* ── TABS ── */}
      {!selectedMateri && (
        <div className="belajar-tabs">
          <button
            className={`belajar-tab ${activeTab === "quiz" ? "active" : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            📝 Quiz
          </button>
          <button
            className={`belajar-tab ${activeTab === "jadwal" ? "active" : ""}`}
            onClick={() => setActiveTab("jadwal")}
          >
            📅 Jadwal Mentoring
            {schedules.length > 0 && (
              <span className="tab-count">{schedules.length}</span>
            )}
          </button>
        </div>
      )}

      {/* =============== QUIZ TAB =============== */}
      {activeTab === "quiz" && !selectedMateri && (
        <>
          {/* Total XP summary */}
          {totalEarnedXp > 0 && (
            <div className="xp-summary clickable" onClick={() => setShowRedeemModal(true)}>
              <div className="xp-summary-left">
                <span className="xp-summary-value">{availableXp} XP</span>
                <span className="xp-summary-label">Tersedia (Klik untuk Tukar)</span>
              </div>
              <div className="xp-summary-right">
                🎁 Tukar
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="belajar-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="belajar-skeleton-card">
                  <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "40%" }} />
                </div>
              ))}
            </div>
          )}

          {/* Quiz Sections */}
          {!loading && (
            <div className="belajar-content-wrapper">
              
              {/* 1. Riwayat Quiz Selesai */}
              {completedMateri.length > 0 && (
                <div className="completed-quizzes-section">
                  <h3 className="section-title">✅ Quiz Selesai</h3>
                  <div className="completed-quizzes-list">
                    {completedMateri.map((materi) => (
                      <div 
                        key={materi._id} 
                        className="completed-quiz-item"
                        onClick={() => setShowRedeemModal(true)}
                        title="Klik untuk Redeem XP"
                      >
                        <span className="cq-title">{materi.title}</span>
                        <span className="cq-score">+{nilaiMap[materi._id].score} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* XP Point Display */}
              <div className="xp-point-card">
                <div className="xp-point-left">
                  <span className="xp-point-icon">⭐</span>
                  <div className="xp-point-info">
                    <span className="xp-point-value">{totalEarnedXp} XP</span>
                    <span className="xp-point-label">Total Dikumpulkan</span>
                  </div>
                </div>
                <div className="xp-point-stats">
                  <span className="xp-point-completed">{completedMateri.length} selesai</span>
                  <span className="xp-point-pending">{pendingMateri.length} tersisa</span>
                </div>
              </div>

              {/* 2. Quiz Tersedia */}
              <div className="pending-quizzes-section">
                <h3 className="section-title">📝 Quiz Tersedia</h3>
                {pendingMateri.length === 0 ? (
                  <div className="belajar-empty">
                    <BookOpen size={48} />
                    <h3>Semua Quiz Telah Diselesaikan!</h3>
                    <p>Nantikan update materi edukasi dari mentor!</p>
                  </div>
                ) : (
                  <div className="belajar-list">
                    {pendingMateri.map((materi) => (
                      <div
                        key={materi._id}
                        className="belajar-card"
                        onClick={() => {
                          setSelectedMateri(materi);
                          setAnswers([]);
                          setXp(null);
                          setSubmitted(false);
                        }}
                      >
                        <h4>{materi.title}</h4>
                        <p>{materi.summary}</p>
                        <div className="belajar-card-footer">
                          <span className="quiz-badge">
                            <FileQuestion />
                            {materi.quizzes.length} Soal
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </>
      )}

      {/* =============== QUIZ VIEW =============== */}
      {selectedMateri && (
        <div className="quiz-section">
          <button
            className="quiz-back-btn"
            onClick={() => {
              setSelectedMateri(null);
              setAnswers([]);
              setXp(null);
              setSubmitted(false);
            }}
          >
            <ArrowLeft />
            Kembali
          </button>

          <h3 className="quiz-title">{selectedMateri.title}</h3>

          {/* ── Progress Bar ── */}
          <div className="quiz-progress">
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{
                  width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="quiz-progress-text">
              {answeredCount} / {totalCount} soal terjawab
            </span>
          </div>

          {selectedMateri.quizzes.map((quiz, qIndex) => (
            <div key={qIndex} className="quiz-card">
              <p className="quiz-question">
                {qIndex + 1}. {quiz.question}
              </p>

              {quiz.options.map((opt, oIndex) => {
                const isCorrect = oIndex === quiz.correctAnswer;
                const isSelected = answers[qIndex] === oIndex;
                const showCorrect = submitted && isCorrect;
                const showWrong = submitted && isSelected && !isCorrect;

                return (
                  <label
                    key={oIndex}
                    className={`quiz-option ${showCorrect ? "correct" : ""} ${showWrong ? "wrong" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`quiz-${qIndex}`}
                      checked={isSelected}
                      onChange={() => handleAnswer(qIndex, oIndex)}
                      disabled={submitted}
                    />
                    <span className="option-text">{opt}</span>
                    {showCorrect && <span className="answer-icon">✅</span>}
                    {showWrong && <span className="answer-icon">❌</span>}
                  </label>
                );
              })}
            </div>
          ))}

          {!submitted && (
            <button
              className="quiz-submit"
              onClick={submitQuiz}
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Submit Jawaban"}
            </button>
          )}

          {xp !== null && (
            <div className="quiz-score">
              <div className="score-value">{xp} XP</div>
              <p>
                🎉 Selamat! Kamu mendapatkan {xp} experience points
              </p>
              <button
                className="quiz-finish-btn"
                onClick={() => {
                  setSelectedMateri(null);
                  setAnswers([]);
                  setXp(null);
                  setSubmitted(false);
                }}
              >
                Kembali ke Daftar Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* =============== JADWAL MENTORING TAB =============== */}
      {activeTab === "jadwal" && !selectedMateri && (
        <>
          {/* Loading skeleton */}
          {schedulesLoading && (
            <div className="belajar-list">
              {[1, 2].map((i) => (
                <div key={i} className="belajar-skeleton-card">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className="skeleton" style={{ width: 38, height: 38, borderRadius: "50%" }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: "40%" }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ height: 40, marginTop: 12, borderRadius: 12 }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!schedulesLoading && schedules.length === 0 && (
            <div className="belajar-empty">
              <Calendar size={48} />
              <h3>Belum Ada Jadwal</h3>
              <p>Nantikan jadwal mentoring dari mentor!</p>
            </div>
          )}

          {/* Schedule cards */}
          {!schedulesLoading && schedules.length > 0 && (
            <div className="schedule-grid-belajar">
              {schedules.map((sch) => (
                <div className="schedule-card-belajar" key={sch._id}>
                  <div className="schedule-card-top-b">
                    <div
                      className="schedule-avatar-b"
                      style={{
                        background: getAvatarGradient(
                          sch.mentorId?.name || "M"
                        ),
                      }}
                    >
                      {(sch.mentorId?.name || "M").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong className="schedule-title-b">
                        {sch.title}
                      </strong>
                      <p className="schedule-mentor-b">
                        {sch.mentorId?.name || "Mentor"}
                        {sch.mentorId?.specialization &&
                          ` • ${sch.mentorId.specialization}`}
                      </p>
                    </div>
                  </div>

                  {sch.description && (
                    <p className="schedule-desc-b">{sch.description}</p>
                  )}

                  <div className="schedule-meta-b">
                    <div className="schedule-date-info-b">
                      <Calendar size={13} />
                      <span>{formatScheduleDate(sch.date)}</span>
                    </div>
                    <div className="schedule-date-info-b">
                      <Clock size={13} />
                      <span>{formatScheduleTime(sch.date)}</span>
                    </div>
                  </div>

                  <a
                    href={sch.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="schedule-zoom-btn-b"
                  >
                    <ExternalLink size={14} />
                    Join Zoom Meeting
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Belajar;