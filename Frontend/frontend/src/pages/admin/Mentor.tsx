import React, { useEffect, useState } from "react";
import "./Mentor.css";
import { Pencil, Trash2 } from "lucide-react";
import API from "../services/api";

interface Mentor {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  experience: number;
}

const MentorPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    bio: "",
    experience: "",
    style: "Santai"
  });

  // =====================
  // FETCH MENTORS
  // =====================
  const fetchMentors = async () => {
    try {
      const res = await API.get("/mentor");
      setMentors(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  // =====================
  // HANDLE INPUT
  // =====================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // =====================
  // CREATE MENTOR
  // =====================
  const handleSubmit = async () => {
    try {
      await API.post("/mentor", {
        ...form,
        experience: Number(form.experience)
      });

      fetchMentors();
      alert("Mentor berhasil ditambahkan!");

      setForm({
        name: "",
        email: "",
        password: "",
        specialization: "",
        bio: "",
        experience: "",
        style: "Santai"
      });

    } catch (err: any) {
      alert(err.response?.data?.message || "Terjadi error");
    }
  };

  // =====================
  // DELETE MENTOR
  // =====================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin hapus mentor?")) return;

    try {
      await API.delete(`/mentor/${id}`);
      fetchMentors();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="mentor-wrapper">
      <div className="content">
        <h1>Manajemen Akun Mentor</h1>

        <div className="mentor-grid">

          {/* FORM */}
          <div className="card">
            <h3>Daftarkan Mentor Baru</h3>
            <div className="avatar">👨‍🏫</div>

            <p className="section-title">Kredensial Login</p>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nama Lengkap" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password Login" />

            <p className="section-title">Informasi Profesional</p>
            <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Spesialisasi" />
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio Singkat..." />

            <div className="row">
              <input
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="Tahun Pengalaman"
              />
              <select name="style" value={form.style} onChange={handleChange}>
                <option value="Santai">Gaya: Santai</option>
                <option value="Formal">Gaya: Formal</option>
              </select>
            </div>

            <button className="primary-btn" onClick={handleSubmit}>
              DAFTARKAN MENTOR ⚡
            </button>
          </div>

          {/* LIST */}
          <div className="card">
            <h3>Mentor yang Sudah Terdaftar ({mentors.length})</h3>

            {mentors.map((mentor) => (
              <div key={mentor._id} className="mentor-item">
                <div className="mentor-info">
                  <h4>{mentor.name}</h4>
                  <p className="special">
                    {mentor.specialization} • {mentor.experience}Y EXP
                  </p>
                  <p className="email">{mentor.email}</p>
                </div>

                <div className="actions">
                  <button>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(mentor._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
};

export default MentorPage;
