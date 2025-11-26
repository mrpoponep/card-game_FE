import React from "react";

export default function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <div className="stat-card__icon">{icon}</div>
      </div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}
