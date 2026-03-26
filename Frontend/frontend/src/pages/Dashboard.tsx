import { useState, useEffect } from "react";
import {
  Home,
  TrendingUp,
  BookOpen,
  Users,
  GraduationCap,
  LogOut,
  ArrowUpRight,
  Wallet,
  Coins,
  Briefcase,
  BarChart3,
} from "lucide-react";
import "./Dashboard.css";
import Simulasi from "./Simulasi";
import Belajar from "./Belajar";
import Komunitas from "./Komunitas";
import Ai from "./Ai";
import Onboarding from "./Onboarding";
import CryptoNewsWidget from "../components/CryptoNewsWidget";
import Toast from "./Toast";

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

const formatPrice = (price: number): string => {
  if (price >= 1) {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 0.01) {
    return price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  } else {
    return price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  }
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Profile Update State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAllPortfolio, setShowAllPortfolio] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

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
        setEditName(userData?.name || "");
        setEditEmail(userData?.email || "");

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

  // Best performer (coin with highest profit%)
  const bestPerformer = portfolioWithPrice.length > 0
    ? portfolioWithPrice.reduce((best: any, item: any) =>
      item.profitPercent > (best?.profitPercent || -Infinity) ? item : best
      , null)
    : null;

  const handleSelectCoin = (coin: any) => {
    setSelectedCoin(coin);
    setMenu("simulasi");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          password: editPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUserName(data.data.name);
        setShowProfileModal(false);
        setEditPassword(""); // clear password field
        setToast({ message: "Profil berhasil diperbarui!", type: "success" });
      } else {
        setToast({ message: data.message || "Gagal memperbarui profil", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setToast({ message: "Terjadi kesalahan sistem.", type: "error" });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  if (loading) {
    return (
      <div className="app-wrapper">
        <header className="header">
          <div className="header-left">
            <div className="skeleton" style={{ width: 200, height: 24, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 140, height: 14, marginTop: 6, borderRadius: 6 }} />
          </div>
          <div className="header-actions">
            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%' }} />
          </div>
        </header>
        <main className="main-content">
          <div className="skeleton" style={{ height: 200, borderRadius: 20, marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="skeleton" style={{ flex: 1, height: 48, borderRadius: 14 }} />
            <div className="skeleton" style={{ flex: 1, height: 48, borderRadius: 14 }} />
          </div>
          <div className="skeleton" style={{ height: 52, borderRadius: 16, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 20, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <h1>{getGreeting()}, {userName || "Trader"} 👋</h1>
          <p>Kripto-Z • Simulasi Trading</p>
        </div>
        <div className="header-actions">
          <div
            className="avatar"
            style={{ background: getAvatarGradient(userName || "User"), cursor: "pointer" }}
            onClick={() => setShowProfileModal(true)}
            title="Pengaturan Profil"
          >
            {initial}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {menu === "beranda" && (
          <div className="stagger-children beranda-content">
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
                  <span className="asset-split-label">
                    <Wallet size={14} /> Uang Virtual
                  </span>
                  <strong>${balance.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="asset-split-label">
                    <Coins size={14} /> Aset Kripto
                  </span>
                  <strong>${cryptoValue.toLocaleString()}</strong>
                </div>
              </div>
            </section>

            {/* STATS ROW */}
            <div className="stats-row">
              <div className="stat-mini">
                <Coins size={16} />
                <span>{portfolioWithPrice.length} Aset</span>
              </div>
              <div className="stat-mini">
                <TrendingUp size={16} />
                <span>
                  {bestPerformer
                    ? `${bestPerformer.symbol} ${bestPerformer.profitPercent >= 0 ? "+" : ""}${bestPerformer.profitPercent.toFixed(1)}%`
                    : "— —%"}
                </span>
              </div>
            </div>

            {/* QUICK ACTION */}
            <button
              className="quick-action-btn"
              onClick={() => setMenu("simulasi")}
            >
              <span>Mulai Trading</span>
              <ArrowUpRight />
            </button>

            {/* PORTOFOLIO */}
            <section className="card no-hover">
              <div className="section-header">
                <h3><Briefcase size={18} /> Portofolio Kamu</h3>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {portfolioWithPrice.length > 0 && (
                    <span className={`pl-pill ${totalProfitDollar >= 0 ? "profit" : "loss"}`}>
                      {totalProfitDollar >= 0 ? "+" : ""}${Math.abs(totalProfitDollar).toFixed(2)}
                    </span>
                  )}
                  {portfolioWithPrice.length > 3 && (
                    <span 
                      onClick={() => setShowAllPortfolio(true)} 
                      style={{ cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--primary)" }}
                    >
                      Lihat Semua →
                    </span>
                  )}
                </div>
              </div>

              {portfolioWithPrice.length === 0 && (
                <div className="portfolio-empty">
                  <div className="portfolio-empty-icon">📊</div>
                  <h4>Belum ada aset kripto</h4>
                  <p>Mulai trading untuk membangun portofoliomu!</p>
                  <button onClick={() => setMenu("simulasi")}>
                    Mulai Trading <ArrowUpRight size={16} />
                  </button>
                </div>
              )}

              {portfolioWithPrice.slice(0, 3).map((item: any, index) => (
                <div key={index} className={`portfolio-card ${item.profitDollar >= 0 ? "trend-up" : "trend-down"}`}>
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
                        ${formatPrice(item.totalValue)}
                      </strong>
                      <span className={`profit-dollar ${item.profitDollar >= 0 ? "green" : "red"}`}>
                        {item.profitDollar >= 0 ? "+" : ""}${Math.abs(item.profitDollar).toFixed(2)}
                      </span>
                      <small className={`profit-percent ${item.profitPercent >= 0 ? "green" : "red"}`}>
                        ({item.profitPercent >= 0 ? "+" : ""}{item.profitPercent.toFixed(2)}%)
                      </small>
                    </div>
                  </div>

                  <div className="portfolio-detail">
                    <div>
                      <small>Harga Beli Rata²</small>
                      <span>${formatPrice(item.avgBuyPrice)}</span>
                    </div>
                    <div>
                      <small>Harga Sekarang</small>
                      <span>${formatPrice(item.currentPrice)}</span>
                    </div>
                    <div>
                      <small>Modal</small>
                      <span>${formatPrice(item.invested)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* MARKET */}
            <section className="card no-hover">
              <div className="section-header">
                <h3><BarChart3 size={18} /> Pasar Kripto <small>(7 teratas)</small></h3>
                <span onClick={() => setMenu("simulasi")}>Lihat Semua →</span>
              </div>

              <div className="market-list">
                {market.slice(0, 7).map((coin) => (
                  <div
                    key={coin.id}
                    className="market-card"
                    onClick={() => handleSelectCoin(coin)}
                  >
                    <div className="market-left">
                      <img src={coin.image} className="coin-img-sm" alt={coin.name} />
                      <div>
                        <strong>{coin.symbol.toUpperCase()}</strong>
                        <span>{coin.name}</span>
                      </div>
                    </div>

                    <div className="market-right">
                      <strong>${formatPrice(Number(coin.current_price))}</strong>
                      {coin.market_cap && (
                        <span className="market-cap-label">
                          MCap: ${coin.market_cap >= 1e12
                            ? `${(coin.market_cap / 1e12).toFixed(1)}T`
                            : coin.market_cap >= 1e9
                              ? `${(coin.market_cap / 1e9).toFixed(1)}B`
                              : `${(coin.market_cap / 1e6).toFixed(1)}M`}
                        </span>
                      )}
                      <span
                        className={coin.price_change_percentage_24h >= 0 ? "green" : "red"}
                      >
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <CryptoNewsWidget />
          </div>
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

      {/* MODAL SEMUA PORTOFOLIO */}
      {showAllPortfolio && (
        <div className="portfolio-modal-overlay" onClick={() => setShowAllPortfolio(false)}>
          <div className="portfolio-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="portfolio-modal-header">
              <h2>Semua Aset Kripto Kamu 💼</h2>
              <button className="close-btn" onClick={() => setShowAllPortfolio(false)}>×</button>
            </div>
            <div className="portfolio-modal-body">
              {portfolioWithPrice.map((item: any, index: number) => (
                <div key={index} className={`portfolio-card ${item.profitDollar >= 0 ? "trend-up" : "trend-down"}`}>
                  <div className="portfolio-item">
                    <div className="left">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="coin-img" />
                      ) : (
                        <span className="coin">{item.symbol?.[0] || "?"}</span>
                      )}
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.quantity.toFixed(6)} {item.symbol}</p>
                      </div>
                    </div>
                    <div className="right">
                      <strong>${formatPrice(item.totalValue)}</strong>
                      <span className={`profit-dollar ${item.profitDollar >= 0 ? "green" : "red"}`}>
                        {item.profitDollar >= 0 ? "+" : ""}${Math.abs(item.profitDollar).toFixed(2)}
                      </span>
                      <small className={`profit-percent ${item.profitPercent >= 0 ? "green" : "red"}`}>
                        ({item.profitPercent >= 0 ? "+" : ""}{item.profitPercent.toFixed(2)}%)
                      </small>
                    </div>
                  </div>
                  <div className="portfolio-detail">
                    <div>
                      <small>Harga Beli</small>
                      <span>${formatPrice(item.avgBuyPrice)}</span>
                    </div>
                    <div>
                      <small>Harga Sekarang</small>
                      <span>${formatPrice(item.currentPrice)}</span>
                    </div>
                    <div>
                      <small>Modal</small>
                      <span>${formatPrice(item.invested)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROFIL & LOGOUT */}
      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Pengaturan Profil</h2>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>×</button>
            </div>

            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <div className="profile-form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="profile-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="profile-form-group">
                <label>Password Baru <small>(opsional)</small></label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="profile-save-btn" disabled={updatingProfile}>
                {updatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>

            <div className="profile-modal-footer">
              <button className="logout-modal-btn" onClick={handleLogout}>
                <LogOut size={16} /> Keluar dari Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;