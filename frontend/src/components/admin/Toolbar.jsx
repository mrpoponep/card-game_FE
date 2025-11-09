import React from "react";
import { EyeSlashIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function Toolbar({
  hideWaiting,
  setHideWaiting,
  onReload,
  loadingList,
  onCreate,
}) {
  return (
    <div className="table-toolbar">
      <div className="toolbar__left">
        <label className="toolbar__filter">
          <input
            type="checkbox"
            checked={hideWaiting}
            onChange={(e) => setHideWaiting(e.target.checked)}
          />
          <span className="inline-flex items-center gap-1">
            <EyeSlashIcon className="icon-16" /> Ẩn bàn đang chờ
          </span>
        </label>

        <button onClick={onReload} className="button button--secondary" disabled={loadingList}>
          {loadingList ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      <div className="toolbar__right">
        <button className="button button--secondary" onClick={onCreate}>
          <PlusIcon className="icon-16" />
          Tạo bàn mới
        </button>
      </div>
    </div>
  );
}
