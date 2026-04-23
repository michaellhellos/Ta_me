import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import "./PantauSiswa.css";

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

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/trade/mentor/students`,
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

  const fetchHistory = async (userId: string) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/trade/mentor/history/${userId}`,
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
    <div className="pantau-container">
      <h2 className="pantau-title">Daftar Siswa</h2>

      {loading && <p className="pantau-loading">Loading...</p>}

      {/* TABLE */}
      <div className="pantau-table-wrapper">
        <table className="pantau-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Total Profit</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={3} className="pantau-empty">Belum ada data siswa</td>
              </tr>
            )}

            {students.map(student => (
              <tr
                key={student._id}
                onClick={() => handleClick(student)}
                className="pantau-row"
              >
                <td><strong>{student.name}</strong></td>
                <td>{student.email}</td>
                <td
                  className={
                    student.totalProfit >= 0
                      ? "profit-green"
                      : "profit-red"
                  }
                >
                  {student.totalProfit >= 0 ? "+" : ""}
                  {student.totalProfit.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">
              History — {selected.name}
            </h3>

            {history.length === 0 && (
              <p className="pantau-empty">Belum ada transaksi</p>
            )}

            <div className="history-list">
              {history.map(trx => (
                <div key={trx._id} className="history-item">
                  <div className="history-top">
                    <strong>{trx.name}</strong>
                    <span className={`history-type ${trx.type.toLowerCase()}`}>
                      {trx.type}
                    </span>
                  </div>

                  {trx.type === "SELL" && (
                    <div className="history-profit">
                      Profit:{" "}
                      <span
                        className={
                          trx.profit >= 0
                            ? "profit-green"
                            : "profit-red"
                        }
                      >
                        {trx.profit >= 0 ? "+" : ""}
                        {trx.profit.toFixed(2)} (
                        {trx.percent.toFixed(2)}%)
                      </span>
                    </div>
                  )}

                  <div className="history-date">
                    {new Date(trx.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <hr className="modal-divider" />

            <div className="history-total">
              Total:{" "}
              <span
                className={
                  totalProfit >= 0
                    ? "profit-green"
                    : "profit-red"
                }
              >
                {totalProfit >= 0 ? "+" : ""}
                {totalProfit.toFixed(2)} (
                {totalPercent.toFixed(2)}%)
              </span>
            </div>

            <button
              className="close-btn"
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