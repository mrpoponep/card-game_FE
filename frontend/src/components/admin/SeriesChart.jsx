import React from "react";
import LineChart from "./LineChart";

export default function SeriesChart({ type, data, loadingSeries, errorSeries }) {
  if (errorSeries) return <div className="error-message mt-4">{errorSeries}</div>;
  if (!data || data.length === 0 || loadingSeries) return null;

  const label =
    type === "coin"    ? "Biểu đồ Coin theo ngày" :
    type === "players" ? "Người chơi active theo ngày" :
    type === "matches" ? "Ván chơi theo ngày" :
                         "Bàn chơi được dùng theo ngày";

  const unit =
    type === "coin"    ? "coin" :
    type === "players" ? "người" :
    type === "matches" ? "ván"   : "bàn";

  return <LineChart data={data} label={label} unit={unit} />;
}
