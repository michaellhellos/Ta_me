// import { useState, useEffect } from "react";
// import "./Dashboard.css";
// import Simulasi from "./Simulasi";
// import Belajar from "./Belajar";
// import Komunitas from "./Komunitas";
// import Ai from "./Ai";

// type Menu = "beranda" | "simulasi" | "belajar" | "komunitas" | "ai";

// const Dashboard = () => {
//   const [menu, setMenu] = useState<Menu>("beranda");

//   // ✅ pastikan ARRAY dari awal
//   const [market, setMarket] = useState<any[]>([]);
//   const [portfolio, setPortfolio] = useState<any[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [selectedCoin, setSelectedCoin] = useState<any>(null);
//   const [balance, setBalance] = useState(0);

//   // ================= AMBIL DATA =================
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;

//         const [coinRes, userRes] = await Promise.all([
//           fetch("http://localhost:5000/api/trade/coins"),
//           fetch("http://localhost:5000/api/user/me", {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ]);

//         const coinData = await coinRes.json();
//         const userData = await userRes.json();

//         // ✅ VALIDASI COIN
//         if (coinData?.success && Array.isArray(coinData.data)) {
//           setMarket(coinData.data);
//         } else {
//           setMarket([]);
//         }

//         // ✅ VALIDASI USER
//         if (userRes.ok) {
//           setBalance(userData.balance || 0);
//           setPortfolio(Array.isArray(userData.portfolio) ? userData.portfolio : []);
//         }
//       } catch (err) {
//         console.error("Dashboard error:", err);
//         setMarket([]);
//         setPortfolio([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // ================= HITUNG PORTOFOLIO =================
//   const portfolioWithPrice = Array.isArray(portfolio)
//     ? portfolio.map((item) => {
//         const marketCoin = market.find(
//           (c) => c.symbol?.toUpperCase() === item.symbol
//         );

//         const currentPrice = marketCoin?.current_price ?? item.price ?? 0;
//         const totalValue = item.quantity * currentPrice;
//         const profitPercent =
//           item.price > 0
//             ? ((currentPrice - item.price) / item.price) * 100
//             : 0;

//         return {
//           ...item,
//           currentPrice,
//           totalValue,
//           profitPercent
//         };
//       })
//     : [];

//   const cryptoValue = portfolioWithPrice.reduce(
//     (sum, item) => sum + item.totalValue,
//     0
//   );

//   const totalAsset = balance + cryptoValue;

//   // ================= UI =================
//   const handleSelectCoin = (coin: any) => {
//     setSelectedCoin(coin);
//     setMenu("simulasi");
//   };

//   return (
//     <div className="dashboard">
//       <header className="header">
//         <div>
//           <h1>Kripto-Z</h1>
//           <p>Simulasi Trading • Virtual Money</p>
//         </div>
//         <div className="avatar">👤</div>
//       </header>

//       {menu === "beranda" && (
//         <div className="content">
//           <section className="card total-asset">
//             <div className="total-top">
//               <p>Total Aset Virtual</p>
//               <h2>${totalAsset.toLocaleString()}</h2>
//             </div>

//             <div className="asset-split">
//               <div>
//                 <span>Uang Virtual</span>
//                 <strong>${balance.toLocaleString()}</strong>
//               </div>
//               <div>
//                 <span>Aset Kripto</span>
//                 <strong>${cryptoValue.toLocaleString()}</strong>
//               </div>
//             </div>
//           </section>

//           <section className="card">
//             <h3>Portofolio Kamu</h3>

//             {portfolioWithPrice.length === 0 && (
//               <p className="empty">Kamu belum membeli kripto 🚀</p>
//             )}

//             {portfolioWithPrice.map((item) => (
//               <div key={item.symbol} className="portfolio-item">
//                 <div className="left">
//                   <span className="coin">{item.symbol[0]}</span>
//                   <div>
//                     <strong>{item.name}</strong>
//                     <p>{item.quantity} {item.symbol}</p>
//                   </div>
//                 </div>

//                 <div className="right">
//                   <strong>${item.totalValue.toLocaleString()}</strong>
//                   <span className={item.profitPercent >= 0 ? "green" : "red"}>
//                     {item.profitPercent.toFixed(2)}%
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </section>

//           <section className="card">
//             <h3>Pasar Kripto</h3>

//             {loading && <p>Loading data crypto...</p>}

//             {!loading &&
//               market.map((coin) => (
//                 <div
//                   key={coin.id}
//                   className="market-row clickable"
//                   onClick={() => handleSelectCoin(coin)}
//                 >
//                   <div className="left">
//                     <strong>{coin.symbol.toUpperCase()}</strong>
//                     <span>{coin.name}</span>
//                   </div>

//                   <div className="right">
//                     <strong>${coin.current_price.toLocaleString()}</strong>
//                     <span className={coin.price_change_percentage_24h >= 0 ? "green" : "red"}>
//                       {coin.price_change_percentage_24h.toFixed(2)}%
//                     </span>
//                   </div>
//                 </div>
//               ))}
//           </section>
//         </div>
//       )}

//       {menu === "simulasi" && <Simulasi coin={selectedCoin} />}
//       {menu === "belajar" && <Belajar />}
//       {menu === "komunitas" && <Komunitas />}
//       {menu === "ai" && <Ai />}

//       <nav className="bottom-nav">
//         {["beranda", "simulasi", "belajar", "komunitas", "ai"].map((m) => (
//           <span
//             key={m}
//             className={menu === m ? "active" : ""}
//             onClick={() => setMenu(m as Menu)}
//           >
//             {m}
//           </span>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Dashboard;
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
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [coinRes, userRes] = await Promise.all([
          fetch("http://localhost:5000/api/trade/coins"),
          fetch("http://localhost:5000/api/user/me", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const coinData = await coinRes.json();
        const userData = await userRes.json();

        setMarket(
          coinData?.success && Array.isArray(coinData.data)
            ? coinData.data
            : []
        );

        setBalance(Number(userData?.balance) || 0);
        setPortfolio(
          Array.isArray(userData?.portfolio) ? userData.portfolio : []
        );
      } catch (err) {
        console.error("Dashboard error:", err);
        setMarket([]);
        setPortfolio([]);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ================= HITUNG PORTOFOLIO =================
  const portfolioWithPrice = portfolio.map((item) => {
    const symbol = item.symbol?.toUpperCase();

    const marketCoin = market.find(
      (c) => c.symbol?.toUpperCase() === symbol
    );

    const buyPrice = Number(item.price) || 0;
    const currentPrice = Number(marketCoin?.current_price) || buyPrice;
    const quantity = Number(item.quantity) || 0;

    const totalValue = currentPrice * quantity;

    const profitPercent =
      buyPrice > 0
        ? ((currentPrice - buyPrice) / buyPrice) * 100
        : 0;

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

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>;
  }

  // return (
  //   <div className="dashboard">
  //     <header className="header">
  //       <div>
  //         <h1>Kripto-Z</h1>
  //         <p>Simulasi Trading • Virtual Money</p>
  //       </div>
  //       <div className="avatar">👤</div>
  //     </header>

  //     {menu === "beranda" && (
  //       <div className="content">
  //         {/* TOTAL ASSET */}
  //         <section className="card total-asset">
  //           <div className="total-top">
  //             <p>Total Aset Virtual</p>
  //             <h2>${totalAsset.toLocaleString()}</h2>
  //           </div>

  //           <div className="asset-split">
  //             <div>
  //               <span>Uang Virtual</span>
  //               <strong>${balance.toLocaleString()}</strong>
  //             </div>
  //             <div>
  //               <span>Aset Kripto</span>
  //               <strong>${cryptoValue.toLocaleString()}</strong>
  //             </div>
  //           </div>
  //         </section>

  //         {/* PORTOFOLIO */}
  //         <section className="card">
  //           <h3>Portofolio Kamu</h3>

  //           {portfolioWithPrice.length === 0 && (
  //             <p className="empty">Kamu belum membeli kripto 🚀</p>
  //           )}

  //           {portfolioWithPrice.map((item, index) => (
  //             <div
  //               key={item.coinId || index}
  //               className="portfolio-item"
  //             >
  //               <div className="left">
  //                 <span className="coin">
  //                   {item.symbol?.[0] || "?"}
  //                 </span>
  //                 <div>
  //                   <strong>{item.name}</strong>
  //                   <p>
  //                     {item.quantity} {item.symbol}
  //                   </p>
  //                 </div>
  //               </div>

  //               <div className="right">
  //                 <strong>
  //                   ${item.totalValue.toLocaleString()}
  //                 </strong>
  //                 <span
  //                   className={
  //                     item.profitPercent >= 0 ? "green" : "red"
  //                   }
  //                 >
  //                   {item.profitPercent.toFixed(2)}%
  //                 </span>
  //               </div>
  //             </div>
  //           ))}
  //         </section>

  //         {/* MARKET */}
  //         <section className="card">
  //           <h3>Pasar Kripto</h3>

  //           {market.map((coin) => (
  //             <div
  //               key={coin.id}
  //               className="market-row clickable"
  //               onClick={() => handleSelectCoin(coin)}
  //             >
  //               <div className="left">
  //                 <strong>{coin.symbol.toUpperCase()}</strong>
  //                 <span>{coin.name}</span>
  //               </div>

  //               <div className="right">
  //                 <strong>
  //                   ${coin.current_price.toLocaleString()}
  //                 </strong>
  //                 <span
  //                   className={
  //                     coin.price_change_percentage_24h >= 0
  //                       ? "green"
  //                       : "red"
  //                   }
  //                 >
  //                   {coin.price_change_percentage_24h.toFixed(2)}%
  //                 </span>
  //               </div>
  //             </div>
  //           ))}
  //         </section>
  //       </div>
  //     )}

  //     {menu === "simulasi" && <Simulasi coin={selectedCoin} />}
  //     {menu === "belajar" && <Belajar />}
  //     {menu === "komunitas" && <Komunitas />}
  //     {menu === "ai" && <Ai />}

  //     <nav className="bottom-nav">
  //       {["beranda", "simulasi", "belajar", "komunitas", "ai"].map((m) => (
  //         <span
  //           key={m}
  //           className={menu === m ? "active" : ""}
  //           onClick={() => setMenu(m as Menu)}
  //         >
  //           {m}
  //         </span>
  //       ))}
  //     </nav>
  //   </div>
  // );
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

            {portfolioWithPrice.map((item, index) => (
              <div
                key={item.coinId || index}
                className="portfolio-item"
              >
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
        </>
      )}

      {menu === "simulasi" && <Simulasi coin={selectedCoin} />}
      {menu === "belajar" && <Belajar />}
      {menu === "komunitas" && <Komunitas />}
      {menu === "ai" && <Ai />}

    </main>

    {/* BOTTOM NAV */}
    <nav className="bottom-nav">
      {["beranda", "simulasi", "belajar", "komunitas", "ai"].map((m) => (
        <span
          key={m}
          className={menu === m ? "active" : ""}
          onClick={() => setMenu(m as Menu)}
        >
          {m}
        </span>
      ))}
    </nav>

  </div>
);

};

export default Dashboard;
