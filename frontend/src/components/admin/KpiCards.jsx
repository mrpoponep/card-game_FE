// src/components/admin/KpiCards.jsx
import React from 'react';
import StatCard from './StatCard'; // Đảm bảo đường dẫn đúng
import { UserIcon, SignalIcon, ExclamationTriangleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

const fmt = new Intl.NumberFormat("vi-VN");

function KpiCards({ kpi }) {
  // Component này chỉ nhận dữ liệu kpi và hiển thị
  return (
    <div className="kpi-overview"> 
      <StatCard 
        label="Tổng người chơi" 
        value={fmt.format(kpi.totalPlayers)} 
        icon={<UserIcon className="icon-16 text-blue-500" />} 
      />
      <StatCard 
        label="Đang online" 
        value={fmt.format(kpi.online)} 
        icon={<SignalIcon className="icon-16 text-green-500" />} 
      />
      <StatCard 
        label="Người chơi bị ban" 
        value={fmt.format(kpi.bannedPlayers)} 
        icon={<ExclamationTriangleIcon className="icon-16 text-red-500" />} 
      />
      <StatCard 
        label="Ván hôm nay" 
        value={fmt.format(kpi.gamesToday)} 
        icon={<CalendarDaysIcon className="icon-16 text-purple-500" />} 
      />
    </div>
  );
}

export default KpiCards;