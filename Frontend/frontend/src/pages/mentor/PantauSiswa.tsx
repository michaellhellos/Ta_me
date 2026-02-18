import React, { useState } from "react";
import "./MentorDashboard.css";

interface Student {
  id: number;
  name: string;
  email: string;
  portfolio: number;
  status: "Aktif" | "Tidak Aktif";
}

const dummyStudents: Student[] = [
  {
    id: 1,
    name: "Budi Santoso",
    email: "budi@gmail.com",
    portfolio: 12.5,
    status: "Aktif",
  },
  {
    id: 2,
    name: "Siti Aminah",
    email: "siti@gmail.com",
    portfolio: -5.2,
    status: "Aktif",
  },
  {
    id: 3,
    name: "Andi Crypto",
    email: "andi@gmail.com",
    portfolio: 30.1,
    status: "Tidak Aktif",
  },
];

const PantauSiswa: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredStudents = dummyStudents.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-section">

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#00ffc8" }}>
          Daftar Siswa Aktif & Performa Portfolio
        </h2>

        <input
          type="text"
          placeholder="Cari nama siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #2a3b4c",
            background: "#0f172a",
            color: "white",
            outline: "none",
          }}
        />
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Status</th>
              <th>Performa Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <span
                      className={
                        student.status === "Aktif"
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      {student.status}
                    </span>
                  </td>
                  <td
                    style={{
                      color:
                        student.portfolio >= 0 ? "#00ff99" : "#ff4d4d",
                      fontWeight: "bold",
                    }}
                  >
                    {student.portfolio > 0 ? "+" : ""}
                    {student.portfolio}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                  Tidak ada siswa ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PantauSiswa;
