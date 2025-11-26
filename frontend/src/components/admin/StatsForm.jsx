import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import Select from "./Select";

export default function StatsForm({
  type, setType, TYPE_OPTS,
  from, to, setFrom, setTo,
  onView, isLoading
}) {
  const btnLabel = isLoading ? "Đang tải..." : "Xem thống kê";

  return (
    <>
      <div className="stats-box__form">
        <div className="form-group">
          <label htmlFor="type-select" className="form-label">Loại thống kê</label>
          <Select id="type-select" value={type} onChange={setType} options={TYPE_OPTS} />
        </div>

        <div className="form-group">
          <label htmlFor="from-date" className="form-label">Từ ngày</label>
          <input id="from-date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="to-date" className="form-label">Đến ngày</label>
          <input id="to-date" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="form-input" />
        </div>
      </div>

      <div className="stats-box__actions">
        <button
          onClick={() => onView(type, from, to)}
          disabled={isLoading}
          className="button button--primary"
          title={`Xem thống kê ${type}`}
        >
          <ChartBarIcon className="icon-16" />
          <span>{btnLabel}</span>
        </button>
      </div>
    </>
  );
}
