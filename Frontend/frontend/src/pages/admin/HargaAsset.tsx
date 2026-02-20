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

  // // 🔥 SIMULASI PUMP
  // const pump = (id: string) => {
  //   setCoins((prev) =>
  //     prev.map((coin) =>
  //       coin.id === id
  //         ? {
  //             ...coin,
  //             current_price: coin.current_price * 1.02,
  //             price_change_percentage_24h:
  //               coin.price_change_percentage_24h + 2,
  //           }
  //         : coin
  //     )
  //   );
  // };

  // 🔥 SIMULASI DUMP
  // const dump = (id: string) => {
  //   setCoins((prev) =>
  //     prev.map((coin) =>
  //       coin.id === id
  //         ? {
  //             ...coin,
  //             current_price: coin.current_price * 0.98,
  //             price_change_percentage_24h:
  //               coin.price_change_percentage_24h - 2,
  //           }
  //         : coin
  //     )
  //   );
  // };

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