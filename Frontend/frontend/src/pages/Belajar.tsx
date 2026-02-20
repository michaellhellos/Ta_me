import { useEffect, useState } from "react";
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

const Belajar = () => {
  const [tab, setTab] = useState<"materi" | "mentoring">("materi");
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);

  // 🔥 FETCH PUBLISH DATA
  useEffect(() => {
    fetch("http://localhost:5000/api/materi/materi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMateriList(data.data);
        }
      });
  }, []);

  // HANDLE ANSWER
  const handleAnswer = (quizIndex: number, optionIndex: number) => {
    const updated = [...answers];
    updated[quizIndex] = optionIndex;
    setAnswers(updated);
  };

  // HITUNG NILAI
  const submitQuiz = () => {
    if (!selectedMateri) return;

    const totalSoal = selectedMateri.quizzes.length;
    const poinPerSoal = 100 / totalSoal;

    let totalScore = 0;

    selectedMateri.quizzes.forEach((quiz, index) => {
      if (answers[index] === quiz.correctAnswer) {
        totalScore += poinPerSoal;
      }
    });

    setScore(totalScore);
  };

  return (
    <div className="belajar">
      <section className="belajar-hero">
        <div>
          <h2>Akademi Kripto 🎓</h2>
          <p>Belajar trading seru & interaktif!</p>
        </div>
      </section>

      <div className="belajar-tab">
        <button
          className={tab === "materi" ? "active" : ""}
          onClick={() => setTab("materi")}
        >
          📘 Materi & Kuis
        </button>
        <button
          className={tab === "mentoring" ? "active" : ""}
          onClick={() => setTab("mentoring")}
        >
          🗓 Jadwal Mentoring
        </button>
      </div>

      {/* ===================== MATERI ===================== */}
      {tab === "materi" && (
        <>
          {!selectedMateri ? (
            <div className="belajar-list">
              {materiList.map((materi) => (
                <div
                  key={materi._id}
                  className="belajar-card"
                  onClick={() => {
                    setSelectedMateri(materi);
                    setAnswers([]);
                    setScore(null);
                  }}
                >
                  <h4>{materi.title}</h4>
                  <p>{materi.summary}</p>
                  <span className="progress">
                    {materi.quizzes.length} Soal
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="quiz-section">
              <button
                className="back-btn"
                onClick={() => setSelectedMateri(null)}
              >
                ⬅ Kembali
              </button>

              <h3>{selectedMateri.title}</h3>
              <p>{selectedMateri.summary}</p>

              {selectedMateri.quizzes.map((quiz, qIndex) => (
                <div key={qIndex} className="quiz-card">
                  <p>
                    {qIndex + 1}. {quiz.question}
                  </p>

                  {quiz.options.map((opt, oIndex) => (
                    <label key={oIndex} className="option">
                      <input
                        type="radio"
                        name={`quiz-${qIndex}`}
                        onChange={() =>
                          handleAnswer(qIndex, oIndex)
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ))}

              <button className="submit-btn" onClick={submitQuiz}>
                Submit Jawaban
              </button>

              {score !== null && (
                <div className="score-box">
                  🎉 Nilai Kamu: <strong>{score}</strong>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===================== MENTORING ===================== */}
      {tab === "mentoring" && (
        <div className="belajar-list">
          <div className="belajar-card live">
            <h4>Live Trading Session</h4>
            <p>Coach Kevin • 19:00 WIB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Belajar; 