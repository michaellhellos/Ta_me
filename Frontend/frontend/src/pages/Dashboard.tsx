import { useState, useEffect } from "react";
import "./Dashboard.css";
import Simulasi from "./Simulasi";
import Belajar from "./Belajar";
import Komunitas from "./Komunitas";
import Ai from "./Ai";

type Menu = "beranda" | "simulasi" | "belajar" | "komunitas" | "ai";

const Dashboard = () => {
  const [menu, setMenu] = useState<Menu>("beranda");
  const [market, setMarket] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  // AMBIL DATA CRYPTO DARI BACKEND
  useEffect(() => {
    fetch("http://localhost:5000/api/crypto/coins")
      .then((res) => res.json())
      .then((data) => {
        setMarket(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // KLIK COIN → PINDAH KE SIMULASI
  const handleSelectCoin = (coin: any) => {
    setSelectedCoin(coin);
    setMenu("simulasi");
  };

  return (
    <div className="dashboard">
      {/* ================= HEADER ================= */}
      <header className="header">
        <div>
          <h1>Kripto-Z</h1>
          <p>Level 5 • Streak 🔥 3 Hari</p>
        </div>
        <div className="avatar">👤</div>
      </header>

      {/* ================= CONTENT ================= */}
      {menu === "beranda" && (
        <div className="content">
          {/* ===== TOTAL ASSET ===== */}
          <section className="card total-asset">
            <div className="total-top">
              <p>Total Aset Virtual</p>
              <h2>
                $15,271.27 <span className="green">+52.71%</span>
              </h2>
            </div>

            <div className="asset-split">
              <div>
                <span>Uang Virtual (Cash)</span>
                <strong>$10,000.00</strong>
              </div>
              <div>
                <span>Nilai Aset Kripto</span>
                <strong>$5,271.27</strong>
              </div>
            </div>
          </section>

          {/* ===== PORTOFOLIO (TIDAK DIHAPUS) ===== */}
          <section className="card">
            <h3>Portofolio Kamu</h3>

            <div className="portfolio-item">
              <div className="left">
                <span className="coin btc">₿</span>
                <div>
                  <strong>Bitcoin</strong>
                  <p>0.0500 BTC</p>
                </div>
              </div>
              <div className="right">
                <strong>$2,710.71</strong>
                <span className="green">+$54.24</span>
              </div>
            </div>

            <div className="portfolio-item">
              <div className="left">
                <span className="coin eth">◆</span>
                <div>
                  <strong>Ethereum</strong>
                  <p>1.0000 ETH</p>
                </div>
              </div>
              <div className="right">
                <strong>$2,560.56</strong>
                <span className="green">+$32.11</span>
              </div>
            </div>
          </section>

          {/* ===== PASAR KRIPTO (BISA DIKLIK) ===== */}
          <section className="card">
            <div className="market-header">
              <h3>Pasar Kripto</h3>
              <button>Semua Aset</button>
            </div>

            {loading && <p>Loading data crypto...</p>}

            {!loading &&
              market.map((coin) => (
                <div
                  key={coin.id}
                  className="market-row clickable"
                  onClick={() => handleSelectCoin(coin)}
                >
                  <div className="left">
                    <strong>{coin.symbol.toUpperCase()}</strong>
                    <span>{coin.name}</span>
                  </div>

                  <div className="chart" />

                  <div className="right">
                    <strong>
                      ${coin.current_price.toLocaleString()}
                    </strong>
                    <span
                      className={
                        coin.price_change_percentage_24h >= 0
                          ? "green"
                          : "red"
                      }
                    >
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
          </section>
        </div>
      )}

      {/* ================= SIMULASI ================= */}
      {menu === "simulasi" && (
        <Simulasi coin={selectedCoin} />
      )}

      {menu === "belajar" && <Belajar />}
      {menu === "komunitas" && <Komunitas />}
      {menu === "ai" && <Ai />}

      {/* ================= BOTTOM NAV ================= */}
      <nav className="bottom-nav">
        <span
          className={menu === "beranda" ? "active" : ""}
          onClick={() => setMenu("beranda")}
        >
          🏠 Beranda
        </span>

        <span
          className={menu === "simulasi" ? "active" : ""}
          onClick={() => setMenu("simulasi")}
        >
          📈 Simulasi
        </span>

        <span
          className={menu === "belajar" ? "active" : ""}
          onClick={() => setMenu("belajar")}
        >
          📚 Belajar
        </span>

        <span
          className={menu === "komunitas" ? "active" : ""}
          onClick={() => setMenu("komunitas")}
        >
          👥 Komunitas
        </span>

        <span
          className={menu === "ai" ? "active" : ""}
          onClick={() => setMenu("ai")}
        >
          🤖 AI Mentor
        </span>
      </nav>
    </div>
  );
};

export default Dashboard;
