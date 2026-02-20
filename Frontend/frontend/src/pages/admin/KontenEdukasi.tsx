// import React, { useState } from "react";
// import "./KontenEdukasi.css";

// interface Quiz {
//   question: string;
//   option1: string;
//   option2: string;
//   correctAnswer: number;
// }

// const KontenEdukasi: React.FC = () => {

//   const [title, setTitle] = useState("");
//   const [summary, setSummary] = useState("");

//   const [question, setQuestion] = useState("");
//   const [option1, setOption1] = useState("");
//   const [option2, setOption2] = useState("");
//   const [correctAnswer, setCorrectAnswer] = useState<number>(0);

//   const [quizList, setQuizList] = useState<Quiz[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ========================
//   // ADD QUIZ
//   // ========================
//   const addQuiz = () => {
//     if (!question || !option1 || !option2) {
//       alert("Semua field kuis harus diisi");
//       return;
//     }

//     setQuizList([
//       ...quizList,
//       { question, option1, option2, correctAnswer }
//     ]);

//     setQuestion("");
//     setOption1("");
//     setOption2("");
//     setCorrectAnswer(0);
//   };

//   // ========================
//   // PUBLISH MATERI
//   // ========================
//   const publishMateri = async () => {

//     if (!title || quizList.length === 0) {
//       alert("Judul dan minimal 1 kuis wajib diisi");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await fetch("http://localhost:5000/api/materi", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           title,
//           summary,
//           quizzes: quizList.map((quiz) => ({
//             question: quiz.question,
//             options: [quiz.option1, quiz.option2],
//             correctAnswer: quiz.correctAnswer
//           }))
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert("Materi berhasil dipublish!");

//         setTitle("");
//         setSummary("");
//         setQuizList([]);
//       } else {
//         alert("Gagal publish");
//       }

//     } catch (error) {
//       console.error(error);
//       alert("Terjadi kesalahan server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="konten-container">

//       <h1 className="page-title">Manajemen Konten Edukasi</h1>

//       <div className="konten-grid">

//         {/* LEFT CARD */}
//         <div className="konten-card">

//           <h3>Tambah Materi Baru</h3>

//           <input
//             type="text"
//             placeholder="Judul Materi"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />

//           <textarea
//             placeholder="Ringkasan materi..."
//             value={summary}
//             onChange={(e) => setSummary(e.target.value)}
//           />

//           <hr />

//           <h4>Tambah Kuis Terkait</h4>

//           <input
//             type="text"
//             placeholder="Pertanyaan kuis"
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//           />

//           <div className="quiz-options">
//             <input
//               type="text"
//               placeholder="Opsi 1"
//               value={option1}
//               onChange={(e) => setOption1(e.target.value)}
//             />
//             <input
//               type="text"
//               placeholder="Opsi 2"
//               value={option2}
//               onChange={(e) => setOption2(e.target.value)}
//             />
//           </div>

//           <div style={{ marginTop: "10px" }}>
//             <label>
//               <input
//                 type="radio"
//                 checked={correctAnswer === 0}
//                 onChange={() => setCorrectAnswer(0)}
//               />
//               Opsi 1 Benar
//             </label>

//             <label style={{ marginLeft: "20px" }}>
//               <input
//                 type="radio"
//                 checked={correctAnswer === 1}
//                 onChange={() => setCorrectAnswer(1)}
//               />
//               Opsi 2 Benar
//             </label>
//           </div>

//           <button className="add-quiz-btn" onClick={addQuiz}>
//             + Tambahkan Kuis ke Daftar
//           </button>

//           <button
//             className="publish-btn"
//             onClick={publishMateri}
//             disabled={loading}
//           >
//             {loading ? "Mengirim..." : "PUBLIKASIKAN MATERI"}
//           </button>

//         </div>

//         {/* RIGHT CARD */}
//         <div className="preview-card">
//           <h3>Preview Draft Kuis ({quizList.length})</h3>

//           {quizList.length === 0 ? (
//             <p>Belum ada kuis ditambahkan..</p>
//           ) : (
//             <div>
//               {quizList.map((quiz, index) => (
//                 <div key={index} className="quiz-item">
//                   <p>
//                     {index + 1}. {quiz.question}
//                   </p>
//                   <p>- {quiz.option1}</p>
//                   <p>- {quiz.option2}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// // export default KontenEdukasi;
// import React, { useState } from "react";
// import "./KontenEdukasi.css";

// interface Quiz {
//   question: string;
//   option1: string;
//   option2: string;
//   correctAnswer: number;
// }

// const KontenEdukasi: React.FC = () => {

//   const [title, setTitle] = useState("");
//   const [summary, setSummary] = useState("");

//   const [question, setQuestion] = useState("");
//   const [option1, setOption1] = useState("");
//   const [option2, setOption2] = useState("");
//   const [correctAnswer, setCorrectAnswer] = useState<number>(0);

//   const [quizList, setQuizList] = useState<Quiz[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ========================
//   // ADD QUIZ
//   // ========================
//   const addQuiz = () => {
//     if (!question || !option1 || !option2) {
//       alert("Semua field kuis harus diisi");
//       return;
//     }

//     setQuizList([
//       ...quizList,
//       { question, option1, option2, correctAnswer }
//     ]);

//     setQuestion("");
//     setOption1("");
//     setOption2("");
//     setCorrectAnswer(0);
//   };

//   // ========================
//   // PUBLISH MATERI
//   // ========================
//   const publishMateri = async () => {

//     if (!title || quizList.length === 0) {
//       alert("Judul dan minimal 1 kuis wajib diisi");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await fetch("http://localhost:5000/api/materi/materi", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           title,
//           summary,
//           quizzes: quizList.map((quiz) => ({
//             question: quiz.question,
//             options: [quiz.option1, quiz.option2],
//             correctAnswer: quiz.correctAnswer
//           }))
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert("Materi berhasil dipublish!");

//         setTitle("");
//         setSummary("");
//         setQuizList([]);
//       } else {
//         alert("Gagal publish");
//       }

//     } catch (error) {
//       console.error(error);
//       alert("Terjadi kesalahan server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="konten-container">

//       <h1 className="page-title">Manajemen Konten Edukasi</h1>

//       <div className="konten-grid">

//         {/* LEFT CARD */}
//         <div className="konten-card">

//           <h3>Tambah Materi Baru</h3>

//           <input
//             type="text"
//             placeholder="Judul Materi"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />

//           <textarea
//             placeholder="Ringkasan materi..."
//             value={summary}
//             onChange={(e) => setSummary(e.target.value)}
//           />

//           <hr />

//           <h4>Tambah Kuis Terkait</h4>

//           <input
//             type="text"
//             placeholder="Pertanyaan kuis"
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//           />

//           <div className="quiz-options">
//             <input
//               type="text"
//               placeholder="Opsi 1"
//               value={option1}
//               onChange={(e) => setOption1(e.target.value)}
//             />
//             <input
//               type="text"
//               placeholder="Opsi 2"
//               value={option2}
//               onChange={(e) => setOption2(e.target.value)}
//             />
//           </div>

//           <div style={{ marginTop: "10px" }}>
//             <label>
//               <input
//                 type="radio"
//                 checked={correctAnswer === 0}
//                 onChange={() => setCorrectAnswer(0)}
//               />
//               Opsi 1 Benar
//             </label>

//             <label style={{ marginLeft: "20px" }}>
//               <input
//                 type="radio"
//                 checked={correctAnswer === 1}
//                 onChange={() => setCorrectAnswer(1)}
//               />
//               Opsi 2 Benar
//             </label>
//           </div>

//           <button className="add-quiz-btn" onClick={addQuiz}>
//             + Tambahkan Kuis ke Daftar
//           </button>

//           <button
//             className="publish-btn"
//             onClick={publishMateri}
//             disabled={loading}
//           >
//             {loading ? "Mengirim..." : "PUBLIKASIKAN MATERI"}
//           </button>

//         </div>

//         {/* RIGHT CARD */}
//         <div className="preview-card">
//           <h3>Preview Draft Kuis ({quizList.length})</h3>

//           {quizList.length === 0 ? (
//             <p>Belum ada kuis ditambahkan..</p>
//           ) : (
//             <div>
//               {quizList.map((quiz, index) => (
//                 <div key={index} className="quiz-item">
//                   <p>
//                     {index + 1}. {quiz.question}
//                   </p>
//                   <p>- {quiz.option1}</p>
//                   <p>- {quiz.option2}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default KontenEdukasi;

import React, { useState } from "react";
import "./KontenEdukasi.css";

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

const KontenEdukasi: React.FC = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);

  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  // HANDLE OPTION CHANGE
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  // ADD QUIZ
  const addQuiz = () => {
    if (!question || options.some((opt) => opt === "")) {
      alert("Semua field kuis harus diisi");
      return;
    }

    setQuizList([
      ...quizList,
      { question, options, correctAnswer }
    ]);

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  // PUBLISH
  const publishMateri = async () => {
    if (!title || quizList.length === 0) {
      alert("Judul dan minimal 1 kuis wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/materi/materi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          summary,
          quizzes: quizList
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("Materi berhasil dipublish!");
        setTitle("");
        setSummary("");
        setQuizList([]);
      } else {
        alert("Gagal publish");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="konten-container">
      <h1 className="page-title">Manajemen Konten Edukasi</h1>

      <div className="konten-grid">

        {/* LEFT */}
        <div className="konten-card">
          <h3>Tambah Materi Baru</h3>

          <input
            type="text"
            placeholder="Judul Materi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Ringkasan materi..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <hr />

          <h4>Tambah Kuis</h4>

          <input
            type="text"
            placeholder="Pertanyaan kuis"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="quiz-options">
            {options.map((option, index) => (
              <div key={index} className="option-row">
                <input
                  type="radio"
                  checked={correctAnswer === index}
                  onChange={() => setCorrectAnswer(index)}
                />
                <input
                  type="text"
                  placeholder={`Opsi ${index + 1}`}
                  value={option}
                  onChange={(e) =>
                    handleOptionChange(index, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button className="add-quiz-btn" onClick={addQuiz}>
            + Tambahkan Kuis
          </button>

          <button
            className="publish-btn"
            onClick={publishMateri}
            disabled={loading}
          >
            {loading ? "Mengirim..." : "PUBLIKASIKAN MATERI"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="preview-card">
          <h3>Preview Draft ({quizList.length})</h3>

          {quizList.length === 0 ? (
            <p>Belum ada kuis ditambahkan..</p>
          ) : (
            quizList.map((quiz, index) => (
              <div key={index} className="quiz-item">
                <p><b>{index + 1}. {quiz.question}</b></p>
                {quiz.options.map((opt, i) => (
                  <p key={i}>
                    {i === quiz.correctAnswer ? "✅ " : "⬜ "}
                    {opt}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default KontenEdukasi;