import React from "react";
import "./UserAdmin.css";

interface User {
  id: number;
  name: string;
  email: string;
  equity: number;
  status: "ACTIVE" | "SUSPENDED";
  joined: string;
}

const users: User[] = [
  {
    id: 1,
    name: "Budi Santoso",
    email: "budi@gmail.com",
    equity: 12450,
    status: "ACTIVE",
    joined: "2023-10-12"
  },
  {
    id: 2,
    name: "Siti Aminah",
    email: "siti@gmail.com",
    equity: 8200,
    status: "ACTIVE",
    joined: "2023-11-05"
  },
  {
    id: 3,
    name: "Andi Crypto",
    email: "andi@gmail.com",
    equity: 150,
    status: "SUSPENDED",
    joined: "2023-09-20"
  }
];

const UserAdmin: React.FC = () => {
  return (
    <div className="admin-container">
      {/* MAIN CONTENT */}
      <div className="main">
        <h1>Manajemen Pengguna</h1>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>TRADER</th>
                <th>VIRTUAL EQUITY</th>
                <th>STATUS</th>
                <th>TGL GABUNG</th>
                <th>AKSI</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="equity">
                    ${user.equity.toLocaleString()}
                  </td>

                  <td>
                    <span
                      className={
                        user.status === "ACTIVE"
                          ? "badge active"
                          : "badge suspended"
                      }
                    >
                      {user.status}
                    </span>
                  </td>

                  <td>{user.joined}</td>

                  <td>
                    <button className="edit-btn">⚙ Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAdmin;
