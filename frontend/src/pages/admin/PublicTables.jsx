import React, { useMemo, useState } from "react";
import {
  SignalIcon,
  BoltIcon,
  ClockIcon,
  TableCellsIcon,
  PencilSquareIcon,
  PlusIcon,
  UsersIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const fmt = new Intl.NumberFormat("vi-VN");

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{fmt.format(value)}</div>
    </div>
  );
}

function EditRow({ row, onCancel }) {
  // Giữ form UI, chưa nối API
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
    <tr className="bg-yellow-50">
      <td className="p-2">{row.table_id}</td>
      <td className="p-2">{row.visibility}</td>
      <td className="p-2">
        <input type="number" className="input w-24"
          value={form.min_players} onChange={e=>set('min_players', Number(e.target.value))}/>
        <span className="px-1">/</span>
        <input type="number" className="input w-24"
          value={form.max_players} onChange={e=>set('max_players', Number(e.target.value))}/>
      </td>
      <td className="p-2">
        <input type="number" className="input w-24"
          value={form.small_blind} onChange={e=>set('small_blind', Number(e.target.value))}/>
        <span className="px-1">-</span>
        <input type="number" className="input w-24"
          value={form.max_blind} onChange={e=>set('max_blind', Number(e.target.value))}/>
      </td>
      <td className="p-2">
        <input type="number" className="input w-28"
          value={form.min_buy_in ?? ''} placeholder="null=private"
          onChange={e=>set('min_buy_in', e.target.value===''? null : Number(e.target.value))}/>
        <span className="px-1">-</span>
        <input type="number" className="input w-28"
          value={form.max_buy_in ?? ''} placeholder="null"
          onChange={e=>set('max_buy_in', e.target.value===''? null : Number(e.target.value))}/>
      </td>
      <td className="p-2">
        <input type="number" className="input w-24"
          value={form.rake} step="0.01" onChange={e=>set('rake', Number(e.target.value))}/>
      </td>
      <td className="p-2" colSpan={3}>
        <div className="flex gap-2">
          <button
            className="rounded-xl bg-gray-300 text-white px-3 py-1.5 cursor-not-allowed"
            title="Chưa kết nối API"
            disabled
          >
            Lưu
          </button>
          <button onClick={onCancel}
            className="rounded-xl border px-3 py-1.5 hover:bg-gray-50">Hủy</button>
        </div>
      </td>
    </tr>
  );
}

export default function PublicTables({ from, to }) {
  // metrics khối trên (giữ UI, chưa nối API)
  const [wm, setWm] = useState(60);
  const mt = {
    totalTables: 0,
    publicTables: 0,
    privateTables: 0,
    activeTablesRealtime: 0,
    activeTablesDbWindow: 0,
  };
  const mErr = null;

  // list bàn (giữ trống, chưa nối API)
  const [rows, setRows] = useState([]);
  const [hideStopped, setHideStopped] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newVisibility, setNewVisibility] = useState('public');

  const loadingList = false;
  const lErr = null;

  const filtered = useMemo(() => {
    if (!hideStopped) return rows;
    return rows.filter(r => r.activeRealtime);
  }, [rows, hideStopped]);

  const loadList = () => {
    // Chưa nối API → không làm gì
  };
  const startCreate = () => setCreating(true);
  const doCreate = () => {
    // Chưa nối API → vô hiệu hoá
  };

  return (
    <div className="space-y-6">
      {/* Khối metrics */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Số liệu bàn (Public / Private / Active)</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Window (phút):</span>
          <input
            type="number" min={5}
            className="h-9 w-24 rounded-xl border px-3 text-sm"
            value={wm}
            onChange={(e) => setWm(Math.max(5, Number(e.target.value || 60)))}
          />
        </div>
      </div>

      {mErr ? (
        <div className="p-4 text-red-600">{mErr}</div>
      ) : !mt ? (
        <div className="p-4">Đang tải số liệu bàn...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          <Card title="Tổng số bàn" value={mt.totalTables ?? 0} icon={<TableCellsIcon className="icon-16 text-gray-400" />} />
          <Card title="Bàn Public" value={mt.publicTables ?? 0} icon={<BoltIcon className="icon-16 text-gray-400" />} />
          <Card title="Bàn Private" value={mt.privateTables ?? 0} icon={<BoltIcon className="icon-16 text-gray-400" />} />
          <Card title="Đang hoạt động (realtime)" value={mt.activeTablesRealtime ?? 0} icon={<SignalIcon className="icon-16 text-gray-400" />} />
          <Card title={`Hoạt động (DB ${wm}p)`} value={mt.activeTablesDbWindow ?? 0} icon={<ClockIcon className="icon-16 text-gray-400" />} />
        </div>
      )}

      {/* Toolbar list */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hideStopped} onChange={e=>setHideStopped(e.target.checked)} />
            <span className="inline-flex items-center gap-1">
              <EyeSlashIcon className="icon-16" /> Ẩn bàn đã dừng
            </span>
          </label>
          <button
            onClick={loadList}
            className="rounded-xl border px-3 py-1.5 text-sm bg-gray-200 text-gray-500 cursor-not-allowed"
            title="Chưa kết nối API"
            disabled
          >
            Làm mới
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!creating ? (
            <button
              className="inline-flex items-center gap-2 h-10 rounded-xl bg-gray-300 px-4 text-sm font-medium text-white cursor-not-allowed"
              onClick={startCreate}
              title="Chưa kết nối API"
              disabled
            >
              <PlusIcon className="icon-16" />
              Tạo bàn mới
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select className="input h-10" value={newVisibility} onChange={e=>setNewVisibility(e.target.value)}>
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
              <button className="rounded-xl bg-gray-300 text-white px-3 py-2 text-sm cursor-not-allowed" onClick={doCreate} disabled title="Chưa kết nối API">Tạo</button>
              <button className="rounded-xl border px-3 py-2 text-sm" onClick={()=>setCreating(false)}>Hủy</button>
            </div>
          )}
        </div>
      </div>

      {/* List bàn */}
      <div className="rounded-2xl border bg-white overflow-x-auto">
        {lErr ? (
          <div className="p-4 text-red-600">{lErr}</div>
        ) : loadingList ? (
          <div className="p-4">Đang tải danh sách...</div>
        ) : (
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Loại</th>
                <th className="p-2">Min/Max</th>
                <th className="p-2">Blind</th>
                <th className="p-2">Buy-in</th>
                <th className="p-2">Rake</th>
                <th className="p-2">Presence</th>
                <th className="p-2">Realtime</th>
                <th className="p-2">Last played</th>
                <th className="p-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                row.table_id === editingId ? (
                  <EditRow key={row.table_id} row={row} onCancel={() => setEditingId(null)} />
                ) : (
                  <tr key={row.table_id} className="border-b last:border-0">
                    <td className="p-2 font-medium text-gray-900">{row.table_id}</td>
                    <td className="p-2">{row.visibility}</td>
                    <td className="p-2">{row.min_players}/{row.max_players}</td>
                    <td className="p-2">{fmt.format(row.small_blind)} - {fmt.format(row.max_blind)}</td>
                    <td className="p-2">
                      {row.min_buy_in === null ? 'null' : fmt.format(row.min_buy_in)}
                      {' - '}
                      {row.max_buy_in === null ? 'null' : fmt.format(row.max_buy_in)}
                    </td>
                    <td className="p-2">{row.rake}</td>
                    <td className="p-2 inline-flex items-center gap-1">
                      <UsersIcon className="icon-16 text-gray-500" />
                      <span>{row.presence?.length ?? 0}</span>
                    </td>
                    <td className="p-2">
                      {row.activeRealtime ? (
                        <span className="rounded-full border px-2 py-0.5 text-xs text-green-700 border-green-300 bg-green-50">playing</span>
                      ) : (
                        <span className="rounded-full border px-2 py-0.5 text-xs text-gray-700">idle</span>
                      )}
                    </td>
                    <td className="p-2">{row.lastPlayedAt ? new Date(row.lastPlayedAt).toLocaleString() : '-'}</td>
                    <td className="p-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 hover:bg-gray-50"
                        onClick={() => setEditingId(row.table_id)}
                      >
                        <PencilSquareIcon className="icon-16" />
                        <span>Sửa</span>
                      </button>
                    </td>
                  </tr>
                )
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-6 text-center text-gray-500">Không có bàn phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
