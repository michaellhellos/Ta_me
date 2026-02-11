// export default Simulasi;
import { useEffect, useState, useCallback } from "react";
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
  type: "BUY" | "SELL";
  name: string;
  price: number;
  quantity: number;
  total: number;
};

type SimulasiProps = {
  coin?: Coin | null;
};

const API = "http://localhost:5000/api/trade";

const Simulasi: React.FC<SimulasiProps> = ({ coin }) => {
  const [tab, setTab] = useState<"simulasi" | "riwayat">("simulasi");
  const [mode, setMode] = useState<"buy" | "sell">("buy");

  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingTrade, setLoadingTrade] = useState(false);

  const [amount, setAmount] = useState<number>(100);
  const [history, setHistory] = useState<Transaction[]>([]);

  /* ================= FETCH COINS ================= */
  useEffect(() => {
    fetch(`${API}/coins`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.length) {
          setCoins(json.data);
          setSelectedCoin(coin ?? json.data[0]);
        }
      })
      .catch(() => alert("Gagal mengambil data coin"));
  }, [coin]);

  /* ================= FETCH CHART ================= */
  useEffect(() => {
    if (!selectedCoin) return;

    setLoadingChart(true);
    fetch(`${API}/chart/${selectedCoin.id}`)
      .then((res) => res.json())
      .then((data) => setChartData(data.prices ?? []))
      .finally(() => setLoadingChart(false));
  }, [selectedCoin]);

  /* ================= FETCH HISTORY (REUSABLE) ================= */
  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setHistory(
        data.transactions ||
          data.data ||
          data.user?.transactions ||
          []
      );
    } catch {
      alert("Gagal mengambil riwayat transaksi");
    }
  }, []);

  /* ================= FETCH HISTORY WHEN TAB CHANGED ================= */
  useEffect(() => {
    if (tab === "riwayat") {
      fetchHistory();
    }
  }, [tab, fetchHistory]);

  /* ================= BUY / SELL ================= */
  const handleTrade = async () => {
    if (!selectedCoin || loadingTrade) return;

    if (amount <= 0 || isNaN(amount)) {
      alert("Jumlah tidak valid");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login ulang");
      return;
    }

    const quantity =
      mode === "buy"
        ? amount / selectedCoin.current_price
        : amount;

    setLoadingTrade(true);

    try {
      const res = await fetch(
        `${API}/${mode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coinId: selectedCoin.id,
            quantity,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Transaksi gagal");
      } else {
        alert(mode === "buy" ? "Berhasil membeli!" : "Berhasil menjual!");
        setAmount(100);
        setTab("riwayat");
        await fetchHistory(); // 🔥 PENTING
      }
    } catch {
      alert("Server error");
    } finally {
      setLoadingTrade(false);
    }
  };

  if (!selectedCoin) return <p>Loading...</p>;

  const estimatedQty = amount / selectedCoin.current_price;

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
          {/* HEADER */}
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
              <strong>
                ${selectedCoin.current_price.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* CHART */}
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

          {/* BUY / SELL */}
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

          <div className="trade-panel">
            <label>{mode === "buy" ? "Jumlah (USD)" : "Jumlah Coin"}</label>

            <input
              type="number"
              min={0.000001}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            {mode === "buy" && (
              <small>
                ≈ {estimatedQty.toFixed(6)}{" "}
                {selectedCoin.symbol.toUpperCase()}
              </small>
            )}

            <button
              disabled={loadingTrade}
              className={`trade-btn ${mode === "sell" ? "sell" : ""}`}
              onClick={handleTrade}
            >
              {loadingTrade
                ? "Processing..."
                : mode === "buy"
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
              <strong>{tx.type}</strong> {tx.name}
              <br />
              Qty: {tx.quantity.toFixed(6)}
              <br />
              Harga: ${tx.price.toLocaleString()}
              <br />
              Total: ${tx.total.toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Simulasi;
