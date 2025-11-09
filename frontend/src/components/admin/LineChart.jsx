import React from "react";

export default function LineChart({ data, width = 720, height = 220, label = "", unit = "" }) {
  if (!data || data.length === 0) {
    return <div className="mt-6 text-sm text-gray-500">Không có dữ liệu để vẽ biểu đồ.</div>;
  }

  const pad = { top: 16, right: 12, bottom: 28, left: 40 };
  const innerW = width  - pad.left - pad.right;
  const innerH = height - pad.top  - pad.bottom;

  const values = data.map(d => Number(d.value || 0));
  const minY   = Math.min(0, Math.min(...values));
  const maxY   = Math.max(...values);
  const yRange = (maxY - minY) || 1;

  const xScale = i => (i / Math.max(1, (data.length - 1))) * innerW;
  const yScale = v => innerH - ((v - minY) / yRange) * innerH;

  const linePath = data
    .map((d, i) => {
      const x = pad.left + xScale(i);
      const y = pad.top  + yScale(d.value);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const yTicks = 5;
  const xFirst = 0;
  const xMid   = Math.floor(data.length / 2);
  const xLast  = data.length - 1;

  const pointLabelSize = 9;
  const axisLabelSize  = 10;

  return (
    <div className="linechart-card">
      <div className="linechart-header">
        <div className="linechart-title">{label}</div>
        <div className="linechart-badge">{data.length} ngày</div>
      </div>

      <div className="linechart chart-wrap" role="img" aria-label={label}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1={pad.left} y1={pad.top}          x2={pad.left}      y2={pad.top + innerH} stroke="#e5e7eb" />
          <line x1={pad.left} y1={pad.top + innerH} x2={pad.left + innerW} y2={pad.top + innerH} stroke="#e5e7eb" />

          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const t = i / yTicks;
            const v = minY + (1 - t) * yRange;
            const y = pad.top + (t * innerH);
            return (
              <g key={i}>
                <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="#f3f4f6" />
                <text
                  x={pad.left - 8}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize={axisLabelSize}
                  fill="#6b7280"
                >
                  {Math.round(v)} {unit}
                </text>
              </g>
            );
          })}

          <path
            d={linePath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {data.map((d, i) => {
            const cx = pad.left + xScale(i);
            const cy = pad.top  + yScale(d.value);
            return (
              <g key={d.date || i}>
                <circle cx={cx} cy={cy} r="3.5" fill="#ef4444" />
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize={pointLabelSize} fill="#6b7280">
                  {Math.round(d.value)}
                </text>
              </g>
            );
          })}

          {[xFirst, xMid, xLast].map((idx, i) => {
            const x = pad.left + xScale(idx);
            const y = pad.top + innerH;
            const labelText = data[idx]?.date || `${idx + 1}`;
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={x} y2={y + 4} stroke="#9ca3af" />
                <text x={x} y={y + 16} textAnchor="middle" fontSize={axisLabelSize} fill="#6b7280">
                  {labelText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
