import { useEffect, useState } from "react";
import { ArrowLeft, FileQuestion } from "lucide-react";
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
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [xp, setXp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/materi/materi")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMateriList(data.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleAnswer = (quizIndex: number, optionIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[quizIndex] = optionIndex;
    setAnswers(updatedAnswers);
  };

  const submitQuiz = async () => {
    if (!selectedMateri) return;

    const totalSoal = selectedMateri.quizzes.length;

    if (answers.length < totalSoal) {
      alert("Jawab semua soal terlebih dahulu!");
      return;
    }

    let correctCount = 0;
    selectedMateri.quizzes.forEach((quiz, index) => {
      if (answers[index] === quiz.correctAnswer) correctCount++;
    });

    const maxXp = 10;
    const calculatedXp = Math.round((correctCount / totalSoal) * maxXp);
    setXp(calculatedXp);

    const userData = localStorage.getItem("user");
    if (!userData) {
      alert("User belum login!");
      return;
    }

    const parsedUser = JSON.parse(userData);
    const userId = parsedUser._id;

    try {
      setLoading(true);
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
        alert(data.message || "Gagal menyimpan nilai");
        return;
      }
      console.log("Nilai berhasil disimpan:", data);
    } catch (error) {
      console.error("Gagal simpan nilai:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="belajar-page">
      <div className="belajar-header">
        <h2>Akademi Kripto 🎓</h2>
        <p>Belajar trading seru & interaktif!</p>
      </div>

      {!selectedMateri ? (
        <div className="belajar-list">
          {materiList.map((materi) => (
            <div
              key={materi._id}
              className="belajar-card"
              onClick={() => {
                setSelectedMateri(materi);
                setAnswers([]);
                setXp(null);
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
      ) : (
        <div className="quiz-section">
          <button
            className="quiz-back-btn"
            onClick={() => {
              setSelectedMateri(null);
              setAnswers([]);
              setXp(null);
            }}
          >
            <ArrowLeft />
            Kembali
          </button>

          <h3 className="quiz-title">{selectedMateri.title}</h3>

          {selectedMateri.quizzes.map((quiz, qIndex) => (
            <div key={qIndex} className="quiz-card">
              <p className="quiz-question">
                {qIndex + 1}. {quiz.question}
              </p>

              {quiz.options.map((opt, oIndex) => (
                <label key={oIndex} className="quiz-option">
                  <input
                    type="radio"
                    name={`quiz-${qIndex}`}
                    checked={answers[qIndex] === oIndex}
                    onChange={() => handleAnswer(qIndex, oIndex)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))}

          <button
            className="quiz-submit"
            onClick={submitQuiz}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Submit Jawaban"}
          </button>

          {xp !== null && (
            <div className="quiz-score">
              <div className="score-value">{xp} XP</div>
              <p>🎉 Selamat! Kamu mendapatkan {xp} experience points</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Belajar;