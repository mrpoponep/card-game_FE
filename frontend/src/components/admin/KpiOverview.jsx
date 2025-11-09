import React from "react";
import {
  UserIcon,
  SignalIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import StatCard from "./StatCard";
import { numberFmt as fmt } from "../../pages/admin/constants"; 

export default function KpiOverview({ kpi }) {
  return (
    <div className="kpi-overview">
      <StatCard label="Tổng người chơi" value={fmt.format(kpi.totalPlayers)} icon={<UserIcon className="icon-16" />} />
      <StatCard label="Đang online (realtime)" value={fmt.format(kpi.online)} icon={<SignalIcon className="icon-16" />} />
      <StatCard label="Người chơi bị ban" value={fmt.format(kpi.bannedPlayers)} icon={<ExclamationTriangleIcon className="icon-16" />} />
      <StatCard label="Ván hôm nay" value={fmt.format(kpi.gamesToday)} icon={<CalendarDaysIcon className="icon-16" />} />
    </div>
  );
}
