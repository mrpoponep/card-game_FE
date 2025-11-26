import React from "react";
import StatCard from "./StatCard";
import { TableCellsIcon, BoltIcon, SignalIcon } from "@heroicons/react/24/outline";

const fmt = new Intl.NumberFormat("vi-VN");

export default function MetricsCards({ metrics }) {
  return (
    <div className="public-cards">
      <StatCard label="Tổng số bàn" value={fmt.format(metrics.totalTables ?? 0)} icon={<TableCellsIcon className="icon-16" />} />
      <StatCard label="Bàn Public" value={fmt.format(metrics.publicTables ?? 0)} icon={<BoltIcon className="icon-16" />} />
      <StatCard label="Bàn Private" value={fmt.format(metrics.privateTables ?? 0)} icon={<BoltIcon className="icon-16" />} />
      <StatCard label="Đang hoạt động" value={fmt.format(metrics.activeTables ?? 0)} icon={<SignalIcon className="icon-16" />} />
    </div>
  );
}
