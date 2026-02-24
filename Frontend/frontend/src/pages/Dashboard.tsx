  // import { useState, useEffect } from "react";
  // import { Home, TrendingUp, BookOpen, Users, Bot } from "lucide-react";
  // import "./Dashboard.css";
  // import Simulasi from "./Simulasi";
  // import Belajar from "./Belajar";
  // import Komunitas from "./Komunitas";
  // import Ai from "./Ai";

  // type Menu = "beranda" | "simulasi" | "belajar" | "komunitas" | "ai";

  // const menuIcons: Record<Menu, React.ReactNode> = {
  //   beranda: <Home />,
  //   simulasi: <TrendingUp />,
  //   belajar: <BookOpen />,
  //   komunitas: <Users />,
  //   ai: <Bot />,
  // };

  // const Dashboard = () => {
  //   const [menu, setMenu] = useState<Menu>("beranda");

  //   const [market, setMarket] = useState<any[]>([]);
  //   const [portfolio, setPortfolio] = useState<any[]>([]);
  //   const [balance, setBalance] = useState<number>(0);

  //   const [loading, setLoading] = useState(true);
  //   const [selectedCoin, setSelectedCoin] = useState<any>(null);

  //   // ================= FETCH DATA =================
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const token = localStorage.getItem("token");
  //         if (!token) return;

  //         const [coinRes, userRes] = await Promise.all([
  //           fetch("http://localhost:5000/api/trade/coins"),
  //           fetch("http://localhost:5000/api/user/me", {
  //             headers: { Authorization: `Bearer ${token}` },
  //           }),
  //         ]);

  //         const coinData = await coinRes.json();
  //         const userData = await userRes.json();

  //         setMarket(
  //           coinData?.success && Array.isArray(coinData.data)
  //             ? coinData.data
  //             : []
  //         );

  //         setBalance(Number(userData?.balance) || 0);
  //         setPortfolio(
  //           Array.isArray(userData?.portfolio) ? userData.portfolio : []
  //         );
  //       } catch (err) {
  //         console.error("Dashboard error:", err);
  //         setMarket([]);
  //         setPortfolio([]);
  //         setBalance(0);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchData();
  //   }, []);

  //   // ================= HITUNG PORTOFOLIO =================
  //   const portfolioWithPrice = portfolio.map((item) => {
  //     const symbol = item.symbol?.toUpperCase();
  //     const marketCoin = market.find(
  //       (c) => c.symbol?.toUpperCase() === symbol
  //     );

  //     const buyPrice = Number(item.price) || 0;
  //     const currentPrice = Number(marketCoin?.current_price) || buyPrice;
  //     const quantity = Number(item.quantity) || 0;
  //     const totalValue = currentPrice * quantity;
  //     const profitPercent =
  //       buyPrice > 0
  //         ? ((currentPrice - buyPrice) / buyPrice) * 100
  //         : 0;

  //     return { ...item, currentPrice, totalValue, profitPercent };
  //   });

  //   const cryptoValue = portfolioWithPrice.reduce(
  //     (sum, item) => sum + item.totalValue,
  //     0
  //   );
  //   const totalAsset = balance + cryptoValue;

  //   const handleSelectCoin = (coin: any) => {
  //     setSelectedCoin(coin);
  //     setMenu("simulasi");
  //   };

  //   if (loading) {
  //     return (
  //       <div className="loading-container">
  //         <div className="loading-spinner" />
  //         <span>Memuat dashboard...</span>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="app-wrapper">
  //       {/* HEADER */}
  //       <header className="header">
  //         <div className="header-left">
  //           <h1>Kripto-Z</h1>
  //           <p>Simulasi Trading • Virtual Money</p>
  //         </div>
  //         <div className="avatar">👤</div>
  //       </header>

  //       {/* MAIN CONTENT */}
  //       <main className="main-content">
  //         {menu === "beranda" && (
  //           <>
  //             {/* TOTAL ASSET */}
  //             <section className="card total-asset">
  //               <div className="total-top">
  //                 <div>
  //                   <p>Total Aset Virtual</p>
  //                   <h2>${totalAsset.toLocaleString()}</h2>
  //                 </div>
  //               </div>

  //               <div className="asset-split">
  //                 <div>
  //                   <span>Uang Virtual</span>
  //                   <strong>${balance.toLocaleString()}</strong>
  //                 </div>
  //                 <div>
  //                   <span>Aset Kripto</span>
  //                   <strong>${cryptoValue.toLocaleString()}</strong>
  //                 </div>
  //               </div>
  //             </section>

  //             {/* PORTOFOLIO */}
  //             <section className="card">
  //               <div className="section-header">
  //                 <h3>Portofolio Kamu</h3>
  //               </div>

  //               {portfolioWithPrice.length === 0 && (
  //                 <p className="empty">
  //                   Kamu belum membeli kripto 🚀
  //                 </p>
  //               )}

  //               {portfolioWithPrice.map((item, index) => (
  //                 <div key={item.coinId || index} className="portfolio-item">
  //                   <div className="left">
  //                     <span className="coin">
  //                       {item.symbol?.[0] || "?"}
  //                     </span>
  //                     <div>
  //                       <strong>{item.name}</strong>
  //                       <p>
  //                         {item.quantity} {item.symbol}
  //                       </p>
  //                     </div>
  //                   </div>

  //                   <div className="right">
  //                     <strong>${item.totalValue.toLocaleString()}</strong>
  //                     <span
  //                       className={
  //                         item.profitPercent >= 0 ? "green" : "red"
  //                       }
  //                     >
  //                       {item.profitPercent >= 0 ? "+" : ""}
  //                       {item.profitPercent.toFixed(2)}%
  //                     </span>
  //                   </div>
  //                 </div>
  //               ))}
  //             </section>

  //             {/* MARKET */}
  //             <section className="card">
  //               <div className="section-header">
  //                 <h3>Pasar Kripto</h3>
  //               </div>

  //               {market.map((coin) => (
  //                 <div
  //                   key={coin.id}
  //                   className="market-row"
  //                   onClick={() => handleSelectCoin(coin)}
  //                 >
  //                   <div className="left">
  //                     <strong>{coin.symbol.toUpperCase()}</strong>
  //                     <span>{coin.name}</span>
  //                   </div>

  //                   <div className="right">
  //                     <strong>
  //                       ${coin.current_price.toLocaleString()}
  //                     </strong>
  //                     <span
  //                       className={
  //                         coin.price_change_percentage_24h >= 0
  //                           ? "green"
  //                           : "red"
  //                       }
  //                     >
  //                       {coin.price_change_percentage_24h >= 0 ? "+" : ""}
  //                       {coin.price_change_percentage_24h.toFixed(2)}%
  //                     </span>
  //                   </div>
  //                 </div>
  //               ))}
  //             </section>
  //           </>
  //         )}

  //         {menu === "simulasi" && <Simulasi coin={selectedCoin} />}
  //         {menu === "belajar" && <Belajar />}
  //         {menu === "komunitas" && <Komunitas />}
  //         {menu === "ai" && <Ai />}
  //       </main>

  //       {/* BOTTOM NAV */}
  //       <nav className="bottom-nav">
  //         {(["beranda", "simulasi", "belajar", "komunitas", "ai"] as Menu[]).map(
  //           (m) => (
  //             <div
  //               key={m}
  //               className={`nav-item ${menu === m ? "active" : ""}`}
  //               onClick={() => setMenu(m)}
  //             >
  //               {menuIcons[m]}
  //               <span>{m}</span>
  //             </div>
  //           )
  //         )}
  //       </nav>
  //     </div>
  //   );
  // };

  // export default Dashboard;

  
import { useState, useEffect } from "react";
import { Home, TrendingUp, BookOpen, Users, Bot } from "lucide-react";
import "./Dashboard.css";
import Simulasi from "./Simulasi";
import Belajar from "./Belajar";
import Komunitas from "./Komunitas";
import Ai from "./Ai";

type Menu = "beranda" | "simulasi" | "belajar" | "komunitas" | "ai";

const menuIcons: Record<Menu, React.ReactNode> = {
  beranda: <Home />,
  simulasi: <TrendingUp />,
  belajar: <BookOpen />,
  komunitas: <Users />,
  ai: <Bot />,
};

const Dashboard = () => {
  const [menu, setMenu] = useState<Menu>("beranda");

  const [market, setMarket] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  const API = "http://localhost:5000/api/trade";

  // ================= FETCH DATA =================
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

  const grouped: any = {};

  buyTransactions.forEach((trx) => {
    const symbol = trx.symbol?.toUpperCase();
    if (!symbol) return;

    if (!grouped[symbol]) {
      grouped[symbol] = {
        symbol,
        name: trx.name,
        totalQuantity: 0,
        totalCost: 0,
      };
    }

    grouped[symbol].totalQuantity += Number(trx.quantity);
    grouped[symbol].totalCost +=
      Number(trx.quantity) * Number(trx.price);
  });

  const portfolioWithPrice = Object.values(grouped).map(
    (item: any) => {
      const marketCoin = market.find(
        (c) => c.symbol?.toUpperCase() === item.symbol
      );

      const avgBuyPrice =
        item.totalCost / item.totalQuantity;

      const currentPrice =
        Number(marketCoin?.current_price) || avgBuyPrice;

      const totalValue =
        currentPrice * item.totalQuantity;

      const profitPercent =
        ((currentPrice - avgBuyPrice) /
          avgBuyPrice) *
        100;

      return {
        ...item,
        quantity: item.totalQuantity,
        currentPrice,
        totalValue,
        profitPercent,
      };
    }
  );

  const cryptoValue = portfolioWithPrice.reduce(
    (sum, item: any) => sum + item.totalValue,
    0
  );

  const totalAsset = balance + cryptoValue;

  const handleSelectCoin = (coin: any) => {
    setSelectedCoin(coin);
    setMenu("simulasi");
  };

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
          <h1>Kripto-Z</h1>
          <p>Simulasi Trading • Virtual Money</p>
        </div>
        <div className="avatar">👤</div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {menu === "beranda" && (
          <>
            {/* TOTAL ASSET */}
            <section className="card total-asset">
              <div className="total-top">
                <div>
                  <p>Total Aset Virtual</p>
                  <h2>${totalAsset.toLocaleString()}</h2>
                </div>
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

            {/* PORTOFOLIO */}
            <section className="card">
              <div className="section-header">
                <h3>Portofolio Kamu</h3>
              </div>

              {portfolioWithPrice.length === 0 && (
                <p className="empty">
                  Kamu belum membeli kripto 🚀
                </p>
              )}

              {portfolioWithPrice.map((item: any, index) => (
                <div key={index} className="portfolio-item">
                  <div className="left">
                    <span className="coin">
                      {item.symbol?.[0] || "?"}
                    </span>
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
                        item.profitPercent >= 0
                          ? "green"
                          : "red"
                      }
                    >
                      {item.profitPercent >= 0 ? "+" : ""}
                      {item.profitPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </section>

            {/* MARKET */}
            <section className="card">
              <div className="section-header">
                <h3>Pasar Kripto</h3>
              </div>

              {market.map((coin) => (
                <div
                  key={coin.id}
                  className="market-row"
                  onClick={() => handleSelectCoin(coin)}
                >
                  <div className="left">
                    <strong>
                      {coin.symbol.toUpperCase()}
                    </strong>
                    <span>{coin.name}</span>
                  </div>

                  <div className="right">
                    <strong>
                      $
                      {Number(
                        coin.current_price
                      ).toLocaleString()}
                    </strong>
                    <span
                      className={
                        coin.price_change_percentage_24h >= 0
                          ? "green"
                          : "red"
                      }
                    >
                      {coin.price_change_percentage_24h >=
                      0
                        ? "+"
                        : ""}
                      {Number(
                        coin.price_change_percentage_24h
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {menu === "simulasi" && (
          <Simulasi coin={selectedCoin} />
        )}
        {menu === "belajar" && <Belajar />}
        {menu === "komunitas" && <Komunitas />}
        {menu === "ai" && <Ai />}
      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {(
          ["beranda", "simulasi", "belajar", "komunitas", "ai"] as Menu[]
        ).map((m) => (
          <div
            key={m}
            className={`nav-item ${
              menu === m ? "active" : ""
            }`}
            onClick={() => setMenu(m)}
          >
            {menuIcons[m]}
            <span>{m}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;