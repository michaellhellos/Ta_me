import { useState, useEffect } from "react";
import {
  Home,
  TrendingUp,
  BookOpen,
  Users,
  GraduationCap,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import "./Dashboard.css";
import Simulasi from "./Simulasi";
import Belajar from "./Belajar";
import Komunitas from "./Komunitas";
import Ai from "./Ai";
import Onboarding from "./Onboarding";

type Menu = "beranda" | "simulasi" | "belajar" | "komunitas" | "mentor";

const menuIcons: Record<Menu, React.ReactNode> = {
  beranda: <Home />,
  simulasi: <TrendingUp />,
  belajar: <BookOpen />,
  komunitas: <Users />,
  mentor: <GraduationCap />,
};

/* ── Helpers ── */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

const avatarGradients = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #06b6d4, #38bdf8)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #ec4899, #f43f5e)",
];

const getAvatarGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

/* ── Component ── */
const Dashboard = () => {
  const [menu, setMenu] = useState<Menu>("beranda");
  const [showIntro, setShowIntro] = useState(false);

  const [market, setMarket] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  const API = "http://localhost:5000/api/trade";

  // ================= FETCH DATA =================
  // Check onboarding on mount
  useEffect(() => {
    if (!localStorage.getItem("kripto_z_intro_done")) {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem("kripto_z_intro_done", "true");
    setShowIntro(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [coinRes, userRes, historyRes] = await Promise.all([
          fetch(`${API}/coins`),
          fetch("http://localhost:5000/api/user/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const coinData = await coinRes.json();
        const userData = await userRes.json();
        const historyData = await historyRes.json();

        setMarket(
          coinData?.success && Array.isArray(coinData.data)
            ? coinData.data
            : []
        );

        setBalance(Number(userData?.balance) || 0);
        setUserName(userData?.name || "");

        setHistory(
          historyData.transactions ||
          historyData.data ||
          historyData.user?.transactions ||
          []
        );
      } catch (err) {
        console.error("Dashboard error:", err);
        setMarket([]);
        setBalance(0);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= HITUNG PORTOFOLIO DARI HISTORY =================

  const buyTransactions = history.filter(
    (trx) => trx.type?.toLowerCase() === "buy"
  );

  const sellTransactions = history.filter(
    (trx) => trx.type?.toLowerCase() === "sell"
  );

  // Group by coinId (NOT symbol — Transaction schema may not have symbol)
  const grouped: any = {};

  buyTransactions.forEach((trx) => {
    const id = trx.coinId;
    if (!id) return;

    if (!grouped[id]) {
      grouped[id] = {
        coinId: id,
        name: trx.name,
        totalQuantity: 0,
        totalCost: 0,
      };
    }

    grouped[id].totalQuantity += Number(trx.quantity);
    grouped[id].totalCost += Number(trx.quantity) * Number(trx.price);
  });

  // Subtract SOLDs
  sellTransactions.forEach((trx) => {
    const id = trx.coinId;
    if (!id || !grouped[id]) return;
    grouped[id].totalQuantity -= Number(trx.quantity);
  });

  const portfolioWithPrice = Object.values(grouped)
    .filter((item: any) => item.totalQuantity > 0.000001)
    .map((item: any) => {
      const marketCoin = market.find((c) => c.id === item.coinId);

      const symbol = marketCoin?.symbol?.toUpperCase() || item.coinId;
      const image = marketCoin?.image || "";
      const currentPrice = Number(marketCoin?.current_price) || 0;

      // Weighted avg buy price = totalCost / totalOriginalBought
      const soldQty = sellTransactions
        .filter((s: any) => s.coinId === item.coinId)
        .reduce((sum: number, s: any) => sum + Number(s.quantity), 0);
      const totalBought = item.totalQuantity + soldQty;
      const avgBuyPrice = totalBought > 0 ? item.totalCost / totalBought : 0;

      const totalValue = currentPrice * item.totalQuantity;
      const invested = avgBuyPrice * item.totalQuantity;
      const profitDollar = totalValue - invested;
      const profitPercent = avgBuyPrice > 0
        ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100
        : 0;

      return {
        ...item,
        symbol,
        image,
        quantity: item.totalQuantity,
        avgBuyPrice,
        currentPrice,
        totalValue,
        invested,
        profitDollar,
        profitPercent,
      };
    });

  const cryptoValue = portfolioWithPrice.reduce(
    (sum, item: any) => sum + item.totalValue,
    0
  );

  const totalCost = portfolioWithPrice.reduce(
    (sum, item: any) => sum + item.totalCost,
    0
  );

  const totalProfitDollar = portfolioWithPrice.reduce(
    (sum, item: any) => sum + item.profitDollar,
    0
  );

  const totalProfitPercent = totalCost > 0
    ? ((cryptoValue - totalCost) / totalCost) * 100
    : 0;

  const totalAsset = balance + cryptoValue;

  const handleSelectCoin = (coin: any) => {
    setSelectedCoin(coin);
    setMenu("simulasi");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <span>Memuat dashboard...</span>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <h1>{getGreeting()}, {userName || "Trader"} 👋</h1>
          <p>Kripto-Z • Simulasi Trading</p>
        </div>
        <div className="header-actions">
          <div
            className="avatar"
            style={{ background: getAvatarGradient(userName || "User") }}
          >
            {initial}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {menu === "beranda" && (
          <>
            {/* TOTAL ASSET */}
            <section className="card total-asset no-hover">
              <div className="total-top">
                <div>
                  <p>Total Aset Virtual</p>
                  <h2>${totalAsset.toLocaleString()}</h2>
                </div>
              </div>

              {/* P/L Badge */}
              {portfolioWithPrice.length > 0 && (
                <div className={`pl-badge ${totalProfitDollar >= 0 ? "profit" : "loss"}`}>
                  <span className="pl-dollar">
                    {totalProfitDollar >= 0 ? "+" : ""}${Math.abs(totalProfitDollar).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="pl-percent">
                    ({totalProfitPercent >= 0 ? "+" : ""}{totalProfitPercent.toFixed(2)}%)
                  </span>
                </div>
              )}

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

            {/* QUICK ACTION */}
            <button
              className="quick-action-btn"
              onClick={() => setMenu("simulasi")}
            >
              <span>Mulai Trading</span>
              <ArrowUpRight />
            </button>

            {/* PORTOFOLIO */}
            <section className="card">
              <div className="section-header">
                <h3>Portofolio Kamu</h3>
                {portfolioWithPrice.length > 0 && (
                  <span className={totalProfitDollar >= 0 ? "green" : "red"}>
                    {totalProfitDollar >= 0 ? "+" : ""}${Math.abs(totalProfitDollar).toFixed(2)}
                  </span>
                )}
              </div>

              {portfolioWithPrice.length === 0 && (
                <p className="empty">
                  Kamu belum membeli kripto 🚀
                </p>
              )}

              {portfolioWithPrice.map((item: any, index) => (
                <div key={index} className="portfolio-card">
                  <div className="portfolio-item">
                    <div className="left">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="coin-img" />
                      ) : (
                        <span className="coin">
                          {item.symbol?.[0] || "?"}
                        </span>
                      )}
                      <div>
                        <strong>{item.name}</strong>
                        <p>
                          {item.quantity.toFixed(6)} {item.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="right">
                      <strong>
                        ${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                      <span
                        className={
                          item.profitDollar >= 0
                            ? "green"
                            : "red"
                        }
                      >
                        {item.profitDollar >= 0 ? "+" : ""}${Math.abs(item.profitDollar).toFixed(2)} ({item.profitPercent >= 0 ? "+" : ""}{item.profitPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="portfolio-detail">
                    <div>
                      <small>Avg Buy</small>
                      <span>${item.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <small>Current</small>
                      <span>${item.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <small>Invested</small>
                      <span>${item.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* MARKET */}
      <section className="card">
  <div className="section-header">
    <h3>Pasar Kripto</h3>
    <span onClick={() => setMenu("simulasi")}>Lihat Semua →</span>
  </div>

  <div className="market-list">
    {market.slice(0,7).map((coin) => (
      <div
        key={coin.id}
        className="market-card"
        onClick={() => handleSelectCoin(coin)}
      >
        <div className="market-left">
          <img src={coin.image} className="coin-img-sm" />

          <div>
            <strong>{coin.symbol.toUpperCase()}</strong>
            <span>{coin.name}</span>
          </div>
        </div>

        <div className="market-right">
          <strong>
            ${Number(coin.current_price).toLocaleString()}
          </strong>

          <span
            className={
              coin.price_change_percentage_24h >= 0
                ? "green"
                : "red"
            }
          >
            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
            {coin.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
      </div>
    ))}
  </div>
</section>
          </>
        )}

        {menu === "simulasi" && (
          <Simulasi coin={selectedCoin} />
        )}
        {menu === "belajar" && <Belajar />}
        {menu === "komunitas" && <Komunitas />}
        {menu === "mentor" && <Ai />}
      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {(
          ["beranda", "simulasi", "belajar", "komunitas", "mentor"] as Menu[]
        ).map((m) => (
          <div
            key={m}
            className={`nav-item ${menu === m ? "active" : ""
              }`}
            onClick={() => setMenu(m)}
          >
            {menuIcons[m]}
            <span>{m}</span>
          </div>
        ))}
      </nav>

      {showIntro && <Onboarding onComplete={handleIntroComplete} />}
    </div>
  );
};

export default Dashboard;