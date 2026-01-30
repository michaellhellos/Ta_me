import { useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./Simulasi.css";

const chartData = [
  { price: 69000 },
  { price: 68500 },
  { price: 69200 },
  { price: 70100 },
  { price: 69500 },
  { price: 70200 },
];

const Simulasi = () => {
  const [tab, setTab] = useState<"simulasi" | "riwayat">("simulasi");

  return (
    <div className="sim-page">
      {/* Tabs */}
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
          {/* Header */}
          <div className="sim-header">
            <select>
              <option>Bitcoin (BTC)</option>
              <option>Ethereum (ETH)</option>
            </select>

            <div className="price-box">
              <span>Bitcoin</span>
              <strong>$69,219.44</strong>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <Tooltip />
                <Line
                  dataKey="price"
                  stroke="#22e6a8"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trade */}
          <div className="trade-panel">
            <div className="trade-switch">
              <button className="active">Beli</button>
              <button>Jual</button>
            </div>

            <label>Jumlah (USD)</label>
            <input type="number" defaultValue={100} />

            <button className="trade-btn">Beli BTC</button>
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
