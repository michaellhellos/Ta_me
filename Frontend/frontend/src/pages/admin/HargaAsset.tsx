// import React, { useState } from "react";
// import "./HargaAsset.css";

// interface Coin {
//   id: number;
//   name: string;
//   symbol: string;
//   price: number;
//   change: number;
// }

// const HargaAsset: React.FC = () => {
//   const [coins, setCoins] = useState<Coin[]>([
//     { id: 1, name: "Bitcoin", symbol: "BTC", price: 73637.548, change: 1.16 },
//     { id: 2, name: "Ethereum", symbol: "ETH", price: 2796.121, change: -2.19 },
//     { id: 3, name: "Solana", symbol: "SOL", price: 217.104, change: -0.85 },
//     { id: 4, name: "Cardano", symbol: "ADA", price: 0.535, change: 1.45 },
//     { id: 5, name: "Dogecoin", symbol: "DOGE", price: 0.174, change: 0.51 },
//     { id: 6, name: "Shiba Inu", symbol: "SHIB", price: 0.00002, change: 2.24 }
//   ]);

//   const pump = (id: number) => {
//     setCoins(coins.map(c =>
//       c.id === id
//         ? { ...c, price: c.price * 1.02, change: c.change + 2 }
//         : c
//     ));
//   };

//   const dump = (id: number) => {
//     setCoins(coins.map(c =>
//       c.id === id
//         ? { ...c, price: c.price * 0.98, change: c.change - 2 }
//         : c
//     ));
//   };

//   return (
//     <div className="harga-container">
//       {/* MAIN */}
//       <div className="main">
//         <h1>Manajemen Aset & Harga</h1>

//         <div className="table-box">
//           <table>
//             <thead>
//               <tr>
//                 <th>ASET</th>
//                 <th>SIMBOL</th>
//                 <th>HARGA TERAKHIR</th>
//                 <th>24H CHANGE</th>
//                 <th>AKSI ADMIN</th>
//               </tr>
//             </thead>

//             <tbody>
//               {coins.map((coin) => (
//                 <tr key={coin.id}>
//                   <td>{coin.name}</td>
//                   <td>{coin.symbol}</td>
//                   <td>${coin.price.toLocaleString()}</td>
//                   <td className={coin.change >= 0 ? "green" : "red"}>
//                     {coin.change.toFixed(2)}%
//                   </td>
//                   <td>
//                     <button
//                       className="pump-btn"
//                       onClick={() => pump(coin.id)}
//                     >
//                       PUMP
//                     </button>
//                     <button
//                       className="dump-btn"
//                       onClick={() => dump(coin.id)}
//                     >
//                       DUMP
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>

//     </div>
//   );
// };

// export default HargaAsset;
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HargaAsset.css";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const HargaAsset: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🔥 FETCH DATA DARI BACKEND
  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/trade/coins"); // ganti sesuai port backend kamu
      
      if (res.data.success) {
        setCoins(res.data.data);
      }
    } catch (error) {
      console.error("Gagal ambil data coins:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SIMULASI PUMP
  const pump = (id: string) => {
    setCoins((prev) =>
      prev.map((coin) =>
        coin.id === id
          ? {
              ...coin,
              current_price: coin.current_price * 1.02,
              price_change_percentage_24h:
                coin.price_change_percentage_24h + 2,
            }
          : coin
      )
    );
  };

  // 🔥 SIMULASI DUMP
  const dump = (id: string) => {
    setCoins((prev) =>
      prev.map((coin) =>
        coin.id === id
          ? {
              ...coin,
              current_price: coin.current_price * 0.98,
              price_change_percentage_24h:
                coin.price_change_percentage_24h - 2,
            }
          : coin
      )
    );
  };

  return (
    <div className="harga-container">
      <div className="main">
        <h1>Manajemen Aset & Harga</h1>

        {loading ? (
          <p>Loading data crypto...</p>
        ) : (
          <div className="table-box">
            <table>
              <thead>
                <tr>
                  <th>ASET</th>
                  <th>SIMBOL</th>
                  <th>HARGA TERAKHIR</th>
                  <th>24H CHANGE</th>
                </tr>
              </thead>

              <tbody>
                {coins.map((coin) => (
                  <tr key={coin.id}>
                    <td>{coin.name}</td>
                    <td>{coin.symbol.toUpperCase()}</td>
                    <td>
                      $
                      {coin.current_price?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td
                      className={
                        coin.price_change_percentage_24h >= 0
                          ? "green"
                          : "red"
                      }
                    >
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HargaAsset;