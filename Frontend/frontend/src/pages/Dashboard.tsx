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

  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  // ================= AMBIL DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token tidak ditemukan, silakan login ulang");
          return;
        }

        const [coinRes, userRes] = await Promise.all([
          fetch("http://localhost:5000/api/crypto/coins"),
          fetch("http://localhost:5000/api/user/me", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const coinData = await coinRes.json();
        const userData = await userRes.json();

        if (!userRes.ok) {
          throw new Error(userData.message || "Gagal mengambil data user");
        }

        setMarket(coinData.data);
        setBalance(userData.balance);
        setPortfolio(userData.portfolio);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= HITUNG PORTOFOLIO =================
  const portfolioWithPrice = portfolio.map((item) => {
    const marketCoin = market.find(
      (c) => c.symbol.toUpperCase() === item.symbol
    );

    const currentPrice = marketCoin?.current_price || item.price;
    const totalValue = item.quantity * currentPrice;
    const profitPercent =
      ((currentPrice - item.price) / item.price) * 100;

    return {
      ...item,
      currentPrice,
      totalValue,
      profitPercent
    };
  });

  const cryptoValue = portfolioWithPrice.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );

  const totalAsset = balance + cryptoValue;

  // ================= UI =================
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
          <p>Simulasi Trading • Virtual Money</p>
        </div>
        <div className="avatar">👤</div>
      </header>

      {/* ================= BERANDA ================= */}
      {menu === "beranda" && (
        <div className="content">
          {/* ===== TOTAL ASSET ===== */}
          <section className="card total-asset">
            <div className="total-top">
              <p>Total Aset Virtual</p>
              <h2>${totalAsset.toLocaleString()}</h2>
            </div>

            <div className="asset-split">
              <div>
                <span>Uang Virtual</span>
                <strong>${balance.toLocaleString()}</strong>
              </div>
              <div>
                <span>Aset Kripto</span>
                <strong>${cryptoValue.toLocaleString()}</strong>
              </div>
            </div>
          </section>

          {/* ===== PORTOFOLIO ===== */}
          <section className="card">
            <h3>Portofolio Kamu</h3>

            {portfolioWithPrice.length === 0 && (
              <p className="empty">
                Kamu belum membeli kripto 🚀
              </p>
            )}

            {portfolioWithPrice.map((item) => (
              <div key={item.symbol} className="portfolio-item">
                <div className="left">
                  <span className="coin">{item.symbol[0]}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {item.quantity} {item.symbol}
                    </p>
                  </div>
                </div>

                <div className="right">
                  <strong>
                    ${item.totalValue.toLocaleString()}
                  </strong>
                  <span
                    className={
                      item.profitPercent >= 0 ? "green" : "red"
                    }
                  >
                    {item.profitPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </section>

          {/* ===== MARKET ===== */}
          <section className="card">
            <h3>Pasar Kripto</h3>

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

      {/* ================= MENU ================= */}
      {menu === "simulasi" && <Simulasi coin={selectedCoin} />}
      {menu === "belajar" && <Belajar />}
      {menu === "komunitas" && <Komunitas />}
      {menu === "ai" && <Ai />}

      {/* ================= NAV ================= */}
      <nav className="bottom-nav">
        {["beranda", "simulasi", "belajar", "komunitas", "ai"].map(
          (m) => (
            <span
              key={m}
              className={menu === m ? "active" : ""}
              onClick={() => setMenu(m as Menu)}
            >
              {m}
            </span>
          )
        )}
      </nav>
    </div>
  );
};

export default Dashboard;
