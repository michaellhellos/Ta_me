import "./Ai.css";

const Ai = () => {
  return (
    <div className="ai">
      {/* HEADER TITLE */}
      <div className="ai-header">
        <h2>Pilih Mentor Kamu</h2>
        <p>
          Siapa yang cocok nemenin kamu belajar trading?
          <br />
          Pilih style-nya!
        </p>
      </div>

      {/* MENTOR LIST */}
      <div className="mentor-grid">
        {/* COACH KEVIN */}
        <div className="mentor-card">
          <div className="mentor-top">
            <div className="mentor-avatar">📊</div>
            <div>
              <h3>Coach Kevin</h3>
              <span className="role green">Analisis Teknikal</span>
            </div>
          </div>

          <p className="mentor-desc">
            “Trader full-time sejak 2017. Ahli baca chart dan pola candlestick.
            Gaya ngajar santai tapi daging semua.”
          </p>

          <div className="mentor-info">
            <div>
              <span>Pengalaman</span>
              <strong>7 Tahun</strong>
            </div>
            <div>
              <span>Gaya Mengajar</span>
              <strong>Analitis & Detail</strong>
            </div>
          </div>

          <button className="mentor-btn">Pilih Coach ✨</button>
        </div>

        {/* KAK SARAH */}
        <div className="mentor-card">
          <div className="mentor-top">
            <div className="mentor-avatar pink">🧠</div>
            <div>
              <h3>Kak Sarah</h3>
              <span className="role blue">Psikologi Trading</span>
            </div>
          </div>

          <p className="mentor-desc">
            “Lulusan Psikologi yang terjun ke crypto. Fokus bantu kamu atur
            emosi biar gak FOMO dan panic selling.”
          </p>

          <div className="mentor-info">
            <div>
              <span>Pengalaman</span>
              <strong>4 Tahun</strong>
            </div>
            <div>
              <span>Gaya Mengajar</span>
              <strong>Empatik & Tenang</strong>
            </div>
          </div>

          <button className="mentor-btn">Pilih Kak ✨</button>
        </div>

        {/* BRO DIMAS */}
        <div className="mentor-card">
          <div className="mentor-top">
            <div className="mentor-avatar purple">🚀</div>
            <div>
              <h3>Bro Dimas</h3>
              <span className="role yellow">Fundamental & News</span>
            </div>
          </div>

          <p className="mentor-desc">
            “Pemburu berita crypto terupdate. Jago analisa project micin
            berpotensi to the moon.”
          </p>

          <div className="mentor-info">
            <div>
              <span>Pengalaman</span>
              <strong>5 Tahun</strong>
            </div>
            <div>
              <span>Gaya Mengajar</span>
              <strong>Hype & Energik</strong>
            </div>
          </div>

          <button className="mentor-btn">Pilih Bro ✨</button>
        </div>
      </div>
    </div>
  );
};

export default Ai;
