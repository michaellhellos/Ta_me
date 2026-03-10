import { useEffect, useState } from "react";
import { ArrowLeft, FileQuestion, BookOpen } from "lucide-react";
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

type ToastData = {
  message: string;
  type: "success" | "error" | "info";
} | null;

const Belajar = () => {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [xp, setXp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/materi/materi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMateriList(data.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (quizIndex: number, optionIndex: number) => {
    if (submitted) return;
    const updatedAnswers = [...answers];
    updatedAnswers[quizIndex] = optionIndex;
    setAnswers(updatedAnswers);
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
    const userId = parsedUser._id;

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

  return (
    <div className="belajar-page">
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

      {!selectedMateri ? (
        <>
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

          {/* Empty state */}
          {!loading && materiList.length === 0 && (
            <div className="belajar-empty">
              <BookOpen size={48} />
              <h3>Belum Ada Materi</h3>
              <p>Nantikan update materi edukasi dari mentor!</p>
            </div>
          )}

          {/* Materi list */}
          {!loading && materiList.length > 0 && (
            <div className="belajar-list">
              {materiList.map((materi) => (
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
                  <span className="quiz-badge">
                    <FileQuestion />
                    {materi.quizzes.length} Soal
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
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
                className="quiz-retry-btn"
                onClick={() => {
                  setAnswers([]);
                  setXp(null);
                  setSubmitted(false);
                }}
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Belajar;