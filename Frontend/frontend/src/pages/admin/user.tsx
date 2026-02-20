import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserAdmin.css";

interface User {
  _id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  createdAt: string;
}

const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/user"
      );

      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Gagal ambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(
        `http://localhost:5000/api/auth/user/${selectedUser._id}`,
        selectedUser
      );

      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Gagal update user:", error);
    }
  };

  return (
    <div className="admin-container">
      <div className="main">
        <h1>Manajemen Pengguna</h1>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>TRADER</th>
                  <th>VIRTUAL EQUITY</th>
                  <th>ROLE</th>
                  <th>TGL GABUNG</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td>${user.balance.toLocaleString()}</td>

                    <td>
                      <span className={`badge ${user.role}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(user)}
                      >
                        ⚙ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP EDIT */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit User</h2>

            <label>Nama</label>
            <input
              type="text"
              value={selectedUser.name}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  name: e.target.value
                })
              }
            />

            <label>Email</label>
            <input
              type="email"
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  email: e.target.value
                })
              }
            />

            <label>Balance</label>
            <input
              type="number"
              value={selectedUser.balance}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  balance: Number(e.target.value)
                })
              }
            />

            <label>Role</label>
            <select
              value={selectedUser.role}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  role: e.target.value
                })
              }
            >
              <option value="admin">Admin</option>
              <option value="mentor">Mentor</option>
              <option value="user">User</option>
            </select>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                Simpan
              </button>
              <button
                className="cancel-btn"
                onClick={() => setSelectedUser(null)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;