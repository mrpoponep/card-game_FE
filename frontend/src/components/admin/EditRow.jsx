import React, { useState } from "react";
import Select from "./Select";
import { updateTable } from "../../api";

export default function EditRow({ row, onCancel, onSaved }) {
  const [form, setForm] = useState({
    min_players: row.min_players,
    max_players: row.max_players,
    small_blind: row.small_blind,
    max_blind: row.max_blind,
    min_buy_in: row.min_buy_in,
    max_buy_in: row.max_buy_in,
    rake: row.rake,
    status: row.status || "waiting",
    is_private: row.visibility === "private",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setError("");
    if (form.min_players && form.max_players && Number(form.min_players) > Number(form.max_players)) {
      setError("min_players phải ≤ max_players");
      return;
    }
    if (form.small_blind && form.max_blind && Number(form.small_blind) > Number(form.max_blind)) {
      setError("small_blind phải ≤ max_blind");
      return;
    }
    if (form.min_buy_in != null && form.max_buy_in != null && Number(form.min_buy_in) > Number(form.max_buy_in)) {
      setError("min_buy_in phải ≤ max_buy_in");
      return;
    }
    setSaving(true);
    try {
      await updateTable(row.table_id, {
        min_players: Number(form.min_players),
        max_players: Number(form.max_players),
        small_blind: Number(form.small_blind),
        max_blind: Number(form.max_blind),
        min_buy_in: form.min_buy_in === null || form.min_buy_in === "" ? null : Number(form.min_buy_in),
        max_buy_in: form.max_buy_in === null || form.max_buy_in === "" ? null : Number(form.max_buy_in),
        rake: Number(form.rake),
        status: form.status,
        is_private: !!form.is_private,
      });
      onSaved?.();
    } catch (e) {
      setError(e?.message || "Lỗi khi lưu bàn");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="edit-row">
      <td className="p-2">{row.table_id}</td>
      <td className="p-2">
        <Select
          id={`visibility-${row.table_id}`}
          value={form.is_private ? "private" : "public"}
          onChange={(val) => set("is_private", val === "private")}
          options={[
            { value: "public", label: "public" },
            { value: "private", label: "private" },
          ]}
        />
      </td>
      <td className="p-2">
        <input type="number" className="input w-24" value={form.min_players} onChange={(e) => set("min_players", Number(e.target.value))} />
        <span className="px-1">/</span>
        <input type="number" className="input w-24" value={form.max_players} onChange={(e) => set("max_players", Number(e.target.value))} />
      </td>
      <td className="p-2">
        <input type="number" className="input w-24" value={form.small_blind} onChange={(e) => set("small_blind", Number(e.target.value))} />
        <span className="px-1">-</span>
        <input type="number" className="input w-24" value={form.max_blind} onChange={(e) => set("max_blind", Number(e.target.value))} />
      </td>
      <td className="p-2">
        <input
          type="number"
          className="input w-28"
          value={form.min_buy_in ?? ""}
          placeholder="null=private"
          onChange={(e) => set("min_buy_in", e.target.value === "" ? null : Number(e.target.value))}
        />
        <span className="px-1">-</span>
        <input
          type="number"
          className="input w-28"
          value={form.max_buy_in ?? ""}
          placeholder="null"
          onChange={(e) => set("max_buy_in", e.target.value === "" ? null : Number(e.target.value))}
        />
      </td>
      <td className="p-2">
        <input type="number" step="0.01" className="input w-24" value={form.rake} onChange={(e) => set("rake", Number(e.target.value))} />
      </td>
      <td className="p-2">
        <Select
          id={`status-${row.table_id}`}
          value={form.status}
          onChange={(val) => set("status", val)}
          options={[
            { value: "waiting", label: "waiting" },
            { value: "playing", label: "playing" },
          ]}
        />
      </td>
      <td className="p-2">
        <div style={{ display: "flex", gap: 8 }}>
          <button className="button button--primary" onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
          <button className="btn-table" onClick={onCancel} disabled={saving}>
            Hủy
          </button>
        </div>
        {error && <div className="error-message mt-1">{error}</div>}
      </td>
    </tr>
  );
}
