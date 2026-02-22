import React, { useEffect, useState } from "react";
import axios from "axios";

interface Student {
  _id: string;
  name: string;
  email: string;
  totalProfit: number;
}

interface Transaction {
  _id: string;
  name: string;
  type: string;
  quantity: number;
  price: number;
  profit: number;
  percent: number;
  createdAt: string;
}

const PantauSiswa: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalPercent, setTotalPercent] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudents();
  }, []);

  // ================= FETCH STUDENTS =================
  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/trade/mentor/students",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setStudents(res.data.data || []);
      }

    } catch (error) {
      console.error("FETCH STUDENTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH HISTORY =================
  const fetchHistory = async (userId: string) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/trade/mentor/history/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setHistory(res.data.transactions || []);
        setTotalProfit(res.data.totalProfit || 0);
        setTotalPercent(res.data.totalPercent || 0);
      }

    } catch (error) {
      console.error("FETCH HISTORY ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (student: Student) => {
    setSelected(student);
    fetchHistory(student._id);
  };

  return (
    <div className="content-section">
      <h2 style={{ marginBottom: 20 }}>Daftar Siswa</h2>

      {loading && <p>Loading...</p>}

      {/* ================= TABLE ================= */}
      <table className="student-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Total Profit (%)</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 && (
            <tr>
              <td colSpan={3}>Belum ada data siswa</td>
            </tr>
          )}

          {students.map(student => (
            <tr
              key={student._id}
              onClick={() => handleClick(student)}
              style={{ cursor: "pointer" }}
            >
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td
                style={{
                  color:
                    student.totalProfit >= 0
                      ? "#00ff99"
                      : "#ff4d4d",
                  fontWeight: "bold"
                }}
              >
                {student.totalProfit >= 0 ? "+" : ""}
                {student.totalProfit.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ marginBottom: 15 }}>
              History - {selected.name}
            </h3>

            {history.length === 0 && (
              <p>Belum ada transaksi</p>
            )}

            {history.map(trx => (
              <div
                key={trx._id}
                style={{
                  padding: 10,
                  marginBottom: 10,
                  background: "#111",
                  borderRadius: 8
                }}
              >
                <div>
                  <strong>{trx.name}</strong> ({trx.type})
                </div>

                {trx.type === "SELL" && (
                  <div>
                    Profit:{" "}
                    <span
                      style={{
                        color:
                          trx.profit >= 0
                            ? "#00ff99"
                            : "#ff4d4d",
                        fontWeight: "bold"
                      }}
                    >
                      {trx.profit >= 0 ? "+" : ""}
                      {trx.profit.toFixed(2)} (
                      {trx.percent.toFixed(2)}%)
                    </span>
                  </div>
                )}

                <div style={{ fontSize: 12, color: "#888" }}>
                  {new Date(trx.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

            <hr />

            <h4 style={{ marginTop: 15 }}>
              Total:
              <span
                style={{
                  color:
                    totalProfit >= 0
                      ? "#00ff99"
                      : "#ff4d4d",
                  marginLeft: 10
                }}
              >
                {totalProfit >= 0 ? "+" : ""}
                {totalProfit.toFixed(2)} (
                {totalPercent.toFixed(2)}%)
              </span>
            </h4>

            <button
              style={{
                marginTop: 15,
                padding: "8px 15px",
                cursor: "pointer"
              }}
              onClick={() => {
                setSelected(null);
                setHistory([]);
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantauSiswa;