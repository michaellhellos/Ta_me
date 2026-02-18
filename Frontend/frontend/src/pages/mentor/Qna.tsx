import React from "react";
import "./MentorDashboard.css";
interface Question {
  id: number;
  name: string;
  time: string;
  question: string;
  answered: boolean;
  answer?: string;
}

const questions: Question[] = [
  {
    id: 1,
    name: "Budi Santoso",
    time: "10:30 AM",
    question: "Coach, apakah sekarang saat yang tepat buat serok Bitcoin?",
    answered: false,
  },
  {
    id: 2,
    name: "Siti Aminah",
    time: "09:15 AM",
    question: "Saya bingung baca RSI, bisa tolong jelaskan?",
    answered: true,
    answer:
      "Halo Siti! RSI itu indikator buat lihat kejenuhan pasar. Kalau di bawah 30 biasanya oversold (jenuh jual), kalau di atas 70 overbought (jenuh beli).",
  },
  {
    id: 3,
    name: "Andi Crypto",
    time: "08:45 AM",
    question: "Analisa ETH buat malam ini gimana Coach?",
    answered: false,
  },
];

const Qna: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] text-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold">michaell</h1>
          <p className="text-sm text-green-400">MAKAN BABI SPECIALIST</p>
        </div>

        <button className="border border-red-500 text-red-500 px-4 py-1 rounded-full hover:bg-red-500 hover:text-white transition">
          LOGOUT
        </button>
      </div>

      {/* NAV MENU */}
      <div className="flex gap-8 px-8 py-4 border-b border-gray-800 text-gray-300">
        <span className="hover:text-white cursor-pointer">SESI LIVE</span>
        <span className="text-green-400 border-b-2 border-green-400 pb-1 cursor-pointer">
          INBOX Q&A
        </span>
        <span className="hover:text-white cursor-pointer">PANTAU SISWA</span>
        <span className="hover:text-white cursor-pointer">
          FORUM BROADCAST
        </span>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto mt-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-semibold">
            Inbox Pertanyaan Siswa
          </h2>
          <span className="bg-gray-700 text-sm px-3 py-1 rounded-full">
            Total {questions.length}
          </span>
        </div>

        {/* LIST PERTANYAAN */}
        <div className="space-y-6">
          {questions.map((item) => (
            <div
              key={item.id}
              className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-gray-700"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.time}</p>
                </div>

                {item.answered ? (
                  <span className="bg-green-600 text-xs px-3 py-1 rounded-full">
                    TERJAWAB ✓
                  </span>
                ) : (
                  <button className="bg-green-500 hover:bg-green-600 px-4 py-1 rounded-full text-sm transition">
                    BALAS
                  </button>
                )}
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg text-gray-300">
                "{item.question}"
              </div>

              {item.answered && item.answer && (
                <div className="mt-4 bg-[#0b1220] p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-green-400 font-semibold mb-1">
                    JAWABAN KAMU:
                  </p>
                  <p className="text-gray-300 text-sm">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Qna;
