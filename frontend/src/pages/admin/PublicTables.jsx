import React, { useMemo, useState, useEffect, useCallback } from "react";
import { fetchTables, fetchTableMetrics } from "../../api";
import {
  SignalIcon,
  BoltIcon,
  TableCellsIcon,
  PencilSquareIcon,
  PlusIcon,
  UsersIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const fmt = new Intl.NumberFormat("vi-VN");

function Card({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{title}</span>
        <div className="stat-card__icon">{icon}</div>
      </div>
      <div className="stat-card__value">{fmt.format(value)}</div>
    </div>
  );
}

function EditRow({ row, onCancel }) {
  const [form, setForm] = useState({
    min_players: row.min_players,
    max_players: row.max_players,
    small_blind: row.small_blind,
    max_blind: row.max_blind,
    min_buy_in: row.min_buy_in,
    max_buy_in: row.max_buy_in,
    rake: row.rake
  });
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  return (
    <tr className="edit-row">
      <td className="p-2">{row.table_id}</td>
      <td className="p-2">{row.visibility}</td>
      <td className="p-2">
        <input type="number" className="input w-24" value={form.min_players} onChange={e=>set('min_players', Number(e.target.value))}/>
        <span className="px-1">/</span>
        <input type="number" className="input w-24" value={form.max_players} onChange={e=>set('max_players', Number(e.target.value))}/>
      </td>
      <td className="p-2">
        <input type="number" className="input w-24" value={form.small_blind} onChange={e=>set('small_blind', Number(e.target.value))}/>
        <span className="px-1">-</span>
        <input type="number" className="input w-24" value={form.max_blind} onChange={e=>set('max_blind', Number(e.target.value))}/>
      </td>
      <td className="p-2">
        <input type="number" className="input w-28" value={form.min_buy_in ?? ''} placeholder="null=private" onChange={e=>set('min_buy_in', e.target.value===''? null : Number(e.target.value))}/>
        <span className="px-1">-</span>
        <input type="number" className="input w-28" value={form.max_buy_in ?? ''} placeholder="null" onChange={e=>set('max_buy_in', e.target.value===''? null : Number(e.target.value))}/>
      </td>
      <td className="p-2">
        <input type="number" className="input w-24" value={form.rake} step="0.01" onChange={e=>set('rake', Number(e.target.value))}/>
      </td>
      <td className="p-2" colSpan={3}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="button button--secondary" disabled title="Chưa kết nối API">Lưu</button>
          <button className="btn-table" onClick={onCancel}>Hủy</button>
        </div>
      </td>
    </tr>
  );
}

export default function PublicTables() {
  const [metrics, setMetrics] = useState({
    totalTables: 0,
    publicTables: 0,
    privateTables: 0,
    activeTablesRealtime: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  const [rows, setRows] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [lErr, setLErr] = useState(null);

  const [hideStopped, setHideStopped] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newVisibility, setNewVisibility] = useState('public');

  const filtered = useMemo(() => {
    if (!hideStopped) return rows;
    return rows.filter(r => r.activeRealtime);
  }, [rows, hideStopped]);

  const loadList = useCallback(async () => {
    try {
      setLoadingList(true);
      setLErr(null);
      const tablesData = await fetchTables('public');
      setRows(tablesData);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setLErr('Lỗi khi tải danh sách bàn.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setMetricsLoading(true);
        setMetricsError(null);
        const data = await fetchTableMetrics();
        setMetrics(prev => ({
          ...prev,
          totalTables: data.totalTables,
          publicTables: data.publicTables,
          privateTables: data.privateTables,
          activeTablesRealtime: data.activeTables,
        }));
      } catch (err) {
        console.error("Lỗi tải metrics:", err);
        setMetricsError("Không thể tải số liệu bàn.");
      } finally {
        setMetricsLoading(false);
      }
    };
    loadMetrics();
  }, []);

  const startCreate = () => setCreating(true);
  const doCreate = () => {};

  return (
    <div className="public-tables">
      <div className="public-metrics-title">
        <h3 className="text-lg font-semibold">Số liệu bàn (Public / Private / Active)</h3>
      </div>

      {metricsError ? (
        <div className="error-message">{metricsError}</div>
      ) : metricsLoading ? (
        <div className="loading-placeholder">Đang tải số liệu bàn...</div>
      ) : (
        <div className="public-cards">
          <Card title="Tổng số bàn" value={metrics.totalTables ?? 0} icon={<TableCellsIcon className="icon-16" />} />
          <Card title="Bàn Public" value={metrics.publicTables ?? 0} icon={<BoltIcon className="icon-16" />} />
          <Card title="Bàn Private" value={metrics.privateTables ?? 0} icon={<BoltIcon className="icon-16" />} />
          <Card title="Đang hoạt động" value={metrics.activeTablesRealtime ?? 0} icon={<SignalIcon className="icon-16" />} />
        </div>
      )}

      <div className="table-toolbar">
        <div className="toolbar__left">
          <label className="toolbar__filter">
            <input type="checkbox" checked={hideStopped} onChange={e=>setHideStopped(e.target.checked)} />
            <span className="inline-flex items-center gap-1">
              <EyeSlashIcon className="icon-16" /> Ẩn bàn đã dừng
            </span>
          </label>
          <button onClick={loadList} className="button button--secondary" disabled={loadingList}>
            {loadingList ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <div className="toolbar__right">
          {!creating ? (
            <button
              className="button button--secondary"
              onClick={startCreate}
              title="Chưa kết nối API"
              disabled
            >
              <PlusIcon className="icon-16" />
              Tạo bàn mới
            </button>
          ) : (
            <div className="create-form">
              <select className="form-select" value={newVisibility} onChange={e=>setNewVisibility(e.target.value)}>
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
              <button className="button button--primary" onClick={doCreate} disabled title="Chưa kết nối API">Tạo</button>
              <button className="button button--secondary" onClick={()=>setCreating(false)}>Hủy</button>
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll-wrapper">
          {lErr ? (
            <div className="error-message">{lErr}</div>
          ) : loadingList ? (
            <div className="loading-placeholder">Đang tải danh sách...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại</th>
                  <th>Min/Max</th>
                  <th>Blind</th>
                  <th>Buy-in</th>
                  <th>Rake</th>
                  <th>Presence</th>
                  <th>Realtime</th>
                  <th>Last played</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) =>
                  row.table_id === editingId ? (
                    <EditRow key={row.table_id} row={row} onCancel={() => setEditingId(null)} />
                  ) : (
                    <tr key={row.table_id}>
                      <td className="p-2" style={{ fontWeight: 600, color: "#111827" }}>{row.table_id}</td>
                      <td className="p-2">{row.visibility}</td>
                      <td className="p-2">{row.min_players}/{row.max_players}</td>
                      <td className="p-2">{fmt.format(row.small_blind)} - {fmt.format(row.max_blind)}</td>
                      <td className="p-2">
                        {row.min_buy_in === null ? 'null' : fmt.format(row.min_buy_in)}
                        {" - "}
                        {row.max_buy_in === null ? 'null' : fmt.format(row.max_buy_in)}
                      </td>
                      <td className="p-2">{row.rake}</td>
                      <td className="p-2" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <UsersIcon className="icon-16" />
                        <span>{row.presence?.length ?? 0}</span>
                      </td>
                      <td className="p-2">
                        <span className={`badge-rt ${row.activeRealtime ? "playing" : "idle"}`}>
                          {row.activeRealtime ? "playing" : "idle"}
                        </span>
                      </td>
                      <td className="p-2">{row.lastPlayedAt ? new Date(row.lastPlayedAt).toLocaleString() : '-'}</td>
                      <td className="p-2">
                        <button className="btn-table" onClick={() => setEditingId(row.table_id)}>
                          <PencilSquareIcon className="icon-16" />
                          <span>Sửa</span>
                        </button>
                      </td>
                    </tr>
                  )
                )}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="p-6" style={{ textAlign: "center", color: "#6b7280" }}>Không có bàn phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
