import React, { useState } from "react";
import "./KontenEdukasi.css";

interface Quiz {
  question: string;
  option1: string;
  option2: string;
}

const KontenEdukasi: React.FC = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");

  const [quizList, setQuizList] = useState<Quiz[]>([]);

  const addQuiz = () => {
    if (!question || !option1 || !option2) return;

    setQuizList([
      ...quizList,
      { question, option1, option2 }
    ]);

    setQuestion("");
    setOption1("");
    setOption2("");
  };

  return (
    <div className="konten-container">

      <h1 className="page-title">Manajemen Konten Edukasi</h1>

      <div className="konten-grid">

        {/* LEFT CARD */}
        <div className="konten-card">

          <h3>Tambah Materi Baru</h3>

          <input
            type="text"
            placeholder="Judul Materi (Misal: Apa itu Candle?)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Ringkasan materi..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <hr />

          <h4>Tambah Kuis Terkait</h4>

          <input
            type="text"
            placeholder="Pertanyaan kuis"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="quiz-options">
            <input
              type="text"
              placeholder="Opsi 1"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
            />
            <input
              type="text"
              placeholder="Opsi 2"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
            />
          </div>

          <button className="add-quiz-btn" onClick={addQuiz}>
            + Tambahkan Kuis ke Daftar
          </button>

          <button className="publish-btn">
            PUBLIKASIKAN MATERI
          </button>

        </div>

        {/* RIGHT CARD */}
        <div className="preview-card">
          <h3>Preview Draft Kuis ({quizList.length})</h3>

          {quizList.length === 0 ? (
            <p className="empty-text">
              Belum ada kuis ditambahkan..
            </p>
          ) : (
            <div className="quiz-preview-list">
              {quizList.map((quiz, index) => (
                <div key={index} className="quiz-item">
                  <p className="question">
                    {index + 1}. {quiz.question}
                  </p>
                  <p>- {quiz.option1}</p>
                  <p>- {quiz.option2}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default KontenEdukasi;
