import React, { useState } from "react";
import "./HargaAsset.css";

interface Coin {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change: number;
}

const HargaAsset: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([
    { id: 1, name: "Bitcoin", symbol: "BTC", price: 73637.548, change: 1.16 },
    { id: 2, name: "Ethereum", symbol: "ETH", price: 2796.121, change: -2.19 },
    { id: 3, name: "Solana", symbol: "SOL", price: 217.104, change: -0.85 },
    { id: 4, name: "Cardano", symbol: "ADA", price: 0.535, change: 1.45 },
    { id: 5, name: "Dogecoin", symbol: "DOGE", price: 0.174, change: 0.51 },
    { id: 6, name: "Shiba Inu", symbol: "SHIB", price: 0.00002, change: 2.24 }
  ]);

  const pump = (id: number) => {
    setCoins(coins.map(c =>
      c.id === id
        ? { ...c, price: c.price * 1.02, change: c.change + 2 }
        : c
    ));
  };

  const dump = (id: number) => {
    setCoins(coins.map(c =>
      c.id === id
        ? { ...c, price: c.price * 0.98, change: c.change - 2 }
        : c
    ));
  };

  return (
    <div className="harga-container">
      {/* MAIN */}
      <div className="main">
        <h1>Manajemen Aset & Harga</h1>

        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>ASET</th>
                <th>SIMBOL</th>
                <th>HARGA TERAKHIR</th>
                <th>24H CHANGE</th>
                <th>AKSI ADMIN</th>
              </tr>
            </thead>

            <tbody>
              {coins.map((coin) => (
                <tr key={coin.id}>
                  <td>{coin.name}</td>
                  <td>{coin.symbol}</td>
                  <td>${coin.price.toLocaleString()}</td>
                  <td className={coin.change >= 0 ? "green" : "red"}>
                    {coin.change.toFixed(2)}%
                  </td>
                  <td>
                    <button
                      className="pump-btn"
                      onClick={() => pump(coin.id)}
                    >
                      PUMP
                    </button>
                    <button
                      className="dump-btn"
                      onClick={() => dump(coin.id)}
                    >
                      DUMP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default HargaAsset;
