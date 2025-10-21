import React from "react";

export default function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}