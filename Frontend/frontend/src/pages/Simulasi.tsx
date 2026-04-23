import { useEffect, useState, useCallback, useRef } from "react";
import { API_URL } from "../config";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Toast from "./Toast";
import { MousePointer2, Pencil, Type, Trash2 } from "lucide-react";
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
  coinId?: string;
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

const API = `${API_URL}/trade`;

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

  /* ================= DRAWING STATE ================= */
  const [drawMode, setDrawMode] = useState<"none" | "draw" | "text">("none");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

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
    fetchHistory();
  }, [fetchHistory]);

  const ownedQuantity = history.reduce((acc, trx) => {
    if (trx.coinId === selectedCoin?.id || trx.name === selectedCoin?.name) {
      if (trx.type === "BUY") return acc + trx.quantity;
      if (trx.type === "SELL") return acc - trx.quantity;
    }
    return acc;
  }, 0);

  /* ================= CANVAS DRAWING SETUP ================= */
  useEffect(() => {
    if (!canvasRef.current || tab !== "simulasi" || loadingChart) return;
    
    // setTimeout agar dirender setelah render frame flex yang sesungguhnya di chart-wrapper 
    const initCanvas = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#22c55e"; // warna green accent profit
        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "#e2e8f0"; // text primary
        ctxRef.current = ctx;
      }
    }, 100);

    return () => clearTimeout(initCanvas);
  }, [selectedCoin, tab, loadingChart]);

  /* ================= CANVAS HANDLERS ================= */
  const startDrawingAction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawMode === "none") return;

    const { nativeEvent } = e;
    const ctx = ctxRef.current;
    const x = nativeEvent.offsetX;
    const y = nativeEvent.offsetY;

    if (drawMode === "draw" && ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    } else if (drawMode === "text" && ctx) {
      const textToInject = prompt("Masukkan Teks Anotasi Grafik:");
      if (textToInject) {
        ctx.fillText(textToInject, x, y);
      }
      setDrawMode("none");
    }
  };

  const drawAction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawMode !== "draw") return;
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };

  const stopDrawingAction = () => {
    if (isDrawing && ctxRef.current) {
      ctxRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvasAction = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

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
            <div className="drawing-toolbar">
              <button
                className={`tool-btn ${drawMode === "none" ? "active" : ""}`}
                onClick={() => setDrawMode("none")}
                title="Pointer / Tooltip Aktif"
              >
                <MousePointer2 size={16} />
              </button>
              <button
                className={`tool-btn ${drawMode === "draw" ? "active" : ""}`}
                onClick={() => setDrawMode("draw")}
                title="Coretan Garis Bebas"
              >
                <Pencil size={16} />
              </button>
              <button
                className={`tool-btn ${drawMode === "text" ? "active" : ""}`}
                onClick={() => setDrawMode("text")}
                title="Tulis Teks Anotasi"
              >
                <Type size={16} />
              </button>
              <div className="tool-divider"></div>
              <button
                className="tool-btn danger"
                onClick={clearCanvasAction}
                title="Bersihkan Semua Coretan"
              >
                <Trash2 size={16} />
              </button>
            </div>
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

            {/* KANVAS OVERLAY DRAWING */}
            {!loadingChart && (
              <canvas
                ref={canvasRef}
                className={`drawing-canvas ${drawMode !== "none" ? "active-draw" : "disabled-draw"}`}
                onMouseDown={startDrawingAction}
                onMouseMove={drawAction}
                onMouseUp={stopDrawingAction}
                onMouseLeave={stopDrawingAction}
              />
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

            {mode === "buy" ? (
              <small>
                ≈ {estimatedQty.toFixed(6)}{" "}
                {selectedCoin.symbol.toUpperCase()}
              </small>
            ) : (
              <>
                <div 
                  className="owned-balance" 
                  onClick={() => setAmount(Number(ownedQuantity.toFixed(6)))}
                >
                  Tersedia: {ownedQuantity.toFixed(6)} {selectedCoin.symbol.toUpperCase()}
                </div>
                <div className="percent-buttons">
                  <button onClick={() => setAmount(Number((ownedQuantity * 0.25).toFixed(6)))}>25%</button>
                  <button onClick={() => setAmount(Number((ownedQuantity * 0.50).toFixed(6)))}>50%</button>
                  <button onClick={() => setAmount(Number((ownedQuantity * 0.75).toFixed(6)))}>75%</button>
                  <button className="max-btn" onClick={() => setAmount(Number(ownedQuantity.toFixed(6)))}>Max</button>
                </div>
              </>
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
            const txCoinMatch = coins.find((c) => c.id === tx.coinId || c.name === tx.name);
            const currentPrice = txCoinMatch ? txCoinMatch.current_price : tx.price;

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