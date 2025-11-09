import React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

const fmt = new Intl.NumberFormat("vi-VN");

export default function TableRow({ row, onEdit }) {
  return (
    <tr>
      <td className="p-2" style={{ fontWeight: 600, color: "#111827" }}>{row.table_id}</td>
      <td className="p-2">{row.visibility}</td>
      <td className="p-2">{row.min_players}/{row.max_players}</td>
      <td className="p-2">{fmt.format(row.small_blind)} - {fmt.format(row.max_blind)}</td>
      <td className="p-2">
        {row.min_buy_in === null ? "null" : fmt.format(row.min_buy_in)}{" - "}
        {row.max_buy_in === null ? "null" : fmt.format(row.max_buy_in)}
      </td>
      <td className="p-2">{row.rake}</td>
      <td className="p-2">{row.status || "-"}</td>
      <td className="p-2">
        <button className="btn-table" onClick={() => onEdit(row.table_id)}>
          <PencilSquareIcon className="icon-16" />
          <span>Sửa</span>
        </button>
      </td>
    </tr>
  );
}
