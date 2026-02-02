import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import "./Simulasi.css";

/* ================= TYPES ================= */
type Coin = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
};

type ChartPoint = {
  time: string;
  price: number;
};

type Transaction = {
  type: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

type SimulasiProps = {
  coin: Coin | null;
};

const Simulasi: React.FC<SimulasiProps> = ({ coin }) => {
  const [tab, setTab] = useState<"simulasi" | "riwayat">("simulasi");
  const [mode, setMode] = useState<"buy" | "sell">("buy");

  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const [amount, setAmount] = useState(100);
  const [history, setHistory] = useState<Transaction[]>([]);

  /* ================= FETCH COINS ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/crypto/coins")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCoins(json.data);
          setSelectedCoin(coin ?? json.data[0]);
        }
      })
      .catch(console.error);
  }, []);

  /* ================= FETCH CHART ================= */
  useEffect(() => {
    if (!selectedCoin) return;

    setLoadingChart(true);

    fetch(`http://localhost:5000/api/crypto/chart/${selectedCoin.id}`)
      .then((res) => res.json())
      .then((data) => setChartData(data.prices || []))
      .finally(() => setLoadingChart(false));
  }, [selectedCoin]);

  /* ================= FETCH HISTORY ================= */
  useEffect(() => {
    if (tab !== "riwayat") return;

    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/trade/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistory(data.transactions || []))
      .catch(console.error);
  }, [tab]);

  /* ================= BUY / SELL ================= */
  const handleTrade = async () => {
    if (!selectedCoin) return;

    const token = localStorage.getItem("token");

    const quantity = amount / selectedCoin.current_price;

    const url =
      mode === "buy"
        ? "http://localhost:5000/api/trade/buy"
        : "http://localhost:5000/api/trade/sell";

    const body =
      mode === "buy"
        ? { coinId: selectedCoin.id, amount }
        : { coinId: selectedCoin.id, quantity };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
    } else {
      alert(mode === "buy" ? "Berhasil membeli!" : "Berhasil menjual!");
      setTab("riwayat");
    }
  };

  if (!selectedCoin) return <p>Loading...</p>;

  const quantity = amount / selectedCoin.current_price;

  return (
    <div className="sim-page">
      {/* ================= TABS ================= */}
      <div className="sim-tabs">
        <span
          className={tab === "simulasi" ? "active" : ""}
          onClick={() => setTab("simulasi")}
        >
          Simulasi Trading
        </span>
        <span
          className={tab === "riwayat" ? "active" : ""}
          onClick={() => setTab("riwayat")}
        >
          Riwayat Transaksi
        </span>
      </div>

      {tab === "simulasi" && (
        <>
          {/* ================= HEADER ================= */}
          <div className="sim-header">
            <select
              value={selectedCoin.id}
              onChange={(e) =>
                setSelectedCoin(
                  coins.find((c) => c.id === e.target.value) || null
                )
              }
            >
              {coins.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </option>
              ))}
            </select>

            <div className="price-box">
              <span>{selectedCoin.name}</span>
              <strong>${selectedCoin.current_price.toLocaleString()}</strong>
            </div>
          </div>

          {/* ================= CHART ================= */}
          <div className="chart-wrapper" style={{ height: 320 }}>
            {loadingChart ? (
              <p>Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" />
                  <Tooltip />
                  <Line dataKey="price" stroke="#22e6a8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ================= BUY / SELL TOGGLE ================= */}
          <div className="trade-switch">
            <button
              className={mode === "buy" ? "active" : ""}
              onClick={() => setMode("buy")}
            >
              Beli
            </button>
            <button
              className={mode === "sell" ? "active sell" : "sell"}
              onClick={() => setMode("sell")}
            >
              Jual
            </button>
          </div>

          {/* ================= TRADE PANEL ================= */}
          <div className="trade-panel">
            <label>Jumlah (USD)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <small>
              ≈ {quantity.toFixed(6)} {selectedCoin.symbol.toUpperCase()}
            </small>

            <button
              className={`trade-btn ${mode === "sell" ? "sell" : ""}`}
              onClick={handleTrade}
            >
              {mode === "buy"
                ? `Beli ${selectedCoin.symbol.toUpperCase()}`
                : `Jual ${selectedCoin.symbol.toUpperCase()}`}
            </button>
          </div>
        </>
      )}

      {tab === "riwayat" && (
        <div className="riwayat-box">
          {history.length === 0 && <p>Belum ada transaksi</p>}

          {history.map((tx, i) => (
            <div key={i} className="riwayat-item">
              <strong>{tx.type}</strong> {tx.name} <br />
              Qty: {tx.quantity.toFixed(6)} <br />
              Harga: ${tx.price.toLocaleString()} <br />
              Total: ${tx.total.toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Simulasi;
