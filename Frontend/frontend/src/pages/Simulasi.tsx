import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Toast from "./Toast";
import "./Simulasi.css";

/* ================= TYPES ================= */
type Coin = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image?: string;
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

type ToastData = {
  message: string;
  type: "success" | "error" | "info";
} | null;

const API = "http://localhost:5000/api/trade";

/* ── Custom Chart Tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <span className="tooltip-time">{label}</span>
      <strong className="tooltip-price">
        ${Number(payload[0].value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </strong>
    </div>
  );
};

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

  const [toast, setToast] = useState<ToastData>(null);

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
      .catch(() =>
        setToast({ message: "Gagal mengambil data coin", type: "error" })
      );
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

  /* ================= FETCH HISTORY ================= */
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
      setToast({ message: "Gagal mengambil riwayat transaksi", type: "error" });
    }
  }, []);

  useEffect(() => {
    if (tab === "riwayat") {
      fetchHistory();
    }
  }, [tab, fetchHistory]);

  /* ================= HANDLE TRADE ================= */
  const handleTrade = async () => {
    if (!selectedCoin || loadingTrade) return;

    if (amount <= 0 || isNaN(amount)) {
      setToast({ message: "Jumlah tidak valid", type: "error" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setToast({ message: "Silakan login ulang", type: "error" });
      return;
    }

    const quantity =
      mode === "buy"
        ? amount / selectedCoin.current_price
        : amount;

    setLoadingTrade(true);

    try {
      const res = await fetch(`${API}/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coinId: selectedCoin.id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.message || "Transaksi gagal", type: "error" });
      } else {
        setToast({
          message: mode === "buy"
            ? `Berhasil membeli ${selectedCoin.symbol.toUpperCase()}! 🎉`
            : `Berhasil menjual ${selectedCoin.symbol.toUpperCase()}! 💰`,
          type: "success",
        });
        setAmount(100);
        setTab("riwayat");
        await fetchHistory();
      }
    } catch {
      setToast({ message: "Server error, coba lagi nanti", type: "error" });
    } finally {
      setLoadingTrade(false);
    }
  };

  if (!selectedCoin) return <p>Loading...</p>;

  const estimatedQty = amount / selectedCoin.current_price;

  return (
    <div className="sim-page">
      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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

      {/* ================= SIMULASI ================= */}
      {tab === "simulasi" && (
        <>
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

          <div className="chart-wrapper">
            {loadingChart ? (
              <div className="chart-skeleton">
                <div className="skeleton chart-skeleton-area" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <YAxis
                    hide
                    domain={["dataMin", "dataMax"]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#22c55e", stroke: "#020617", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

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

      {/* ================= RIWAYAT ================= */}
      {tab === "riwayat" && (
        <div className="riwayat-box">
          {history.length === 0 && (
            <p className="empty">Belum ada transaksi</p>
          )}

          {history.map((tx, i) => {
            const currentPrice = selectedCoin.current_price;
            const profit =
              tx.type === "BUY"
                ? (currentPrice - tx.price) * tx.quantity
                : (tx.price - currentPrice) * tx.quantity;
            const percent =
              tx.price > 0
                ? (profit / (tx.price * tx.quantity)) * 100
                : 0;
            const isProfit = profit >= 0;

            return (
              <div
                key={i}
                className={`riwayat-item ${isProfit ? "profit" : "loss"}`}
              >
                <div className="tx-header">
                  <span className={`badge ${tx.type.toLowerCase()}`}>
                    {tx.type}
                  </span>
                  <span className="coin-name">{tx.name}</span>
                </div>

                <div className="tx-body">
                  <div>
                    <small>Qty</small>
                    <span>{tx.quantity.toFixed(6)}</span>
                  </div>
                  <div>
                    <small>Harga</small>
                    <span>${tx.price.toLocaleString()}</span>
                  </div>
                  <div>
                    <small>Total</small>
                    <span>${tx.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="tx-profit">
                  <span className="percent">
                    {isProfit ? "+" : ""}
                    {percent.toFixed(2)}%
                  </span>
                  <span className="usd">
                    {isProfit ? "+" : ""}${profit.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Simulasi;