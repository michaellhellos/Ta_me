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

type SimulasiProps = {
  coin: Coin | null;
};

const Simulasi: React.FC<SimulasiProps> = ({ coin }) => {
  const [tab, setTab] = useState<"simulasi" | "riwayat">("simulasi");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(coin);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  /* ================= AMBIL LIST COIN ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/crypto/coins")
      .then((res) => res.json())
      .then((data) => {
        setCoins(data.data);
        if (!selectedCoin) setSelectedCoin(data.data[0]);
      });
  }, []);

  /* ================= UPDATE DARI DASHBOARD ================= */
  useEffect(() => {
    if (coin) setSelectedCoin(coin);
  }, [coin]);

  /* ================= CHART 3 HARI (ANTI BLANK) ================= */
  useEffect(() => {
    if (!selectedCoin) return;

    setLoadingChart(true);

    fetch(
      `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=3`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.prices || data.prices.length === 0) {
          setChartData([]);
          return;
        }

        // Hitung interval supaya SELALU ADA DATA
        const step = Math.floor(data.prices.length / 24) || 1;

        const sampled = data.prices.filter(
          (_: any, index: number) => index % step === 0
        );

        const formatted = sampled.map((p: any) => ({
          time: new Date(p[0]).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: p[1],
        }));

        setChartData(formatted);
      })
      .catch(console.error)
      .finally(() => setLoadingChart(false));
  }, [selectedCoin]);

  if (!selectedCoin) {
    return <p style={{ padding: 20 }}>Pilih coin terlebih dahulu</p>;
  }

  return (
    <div className="sim-page">
      {/* ================= TAB ================= */}
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
              <strong>
                ${selectedCoin.current_price.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* ================= CHART ================= */}
          <div className="chart-wrapper" style={{ height: 320 }}>
            {loadingChart ? (
              <p style={{ textAlign: "center", paddingTop: 120 }}>
                Loading chart...
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" />
                  <Tooltip />
                  <Line
                    dataKey="price"
                    stroke="#22e6a8"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ================= TRADE ================= */}
          <div className="trade-panel">
            <div className="trade-switch">
              <button className="active">Beli</button>
              <button>Jual</button>
            </div>

            <label>Jumlah (USD)</label>
            <input type="number" defaultValue={100} />

            <button className="trade-btn">
              Beli {selectedCoin.symbol.toUpperCase()}
            </button>
          </div>
        </>
      )}

      {tab === "riwayat" && (
        <div className="riwayat-box">
          <p>Belum ada transaksi.</p>
        </div>
      )}
    </div>
  );
};

export default Simulasi;
