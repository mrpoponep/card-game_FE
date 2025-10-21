import React from "react";

export default function TabSwitch({ tabs, value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border bg-white p-1 shadow-sm">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`px-4 py-2 text-sm rounded-lg transition
              ${active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}