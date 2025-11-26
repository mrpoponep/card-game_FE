import React from "react";

export default function TabSwitch({ tabs, value, onChange }) {
  return (
    <div className="tab-switch">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`tab-switch__btn${active ? " is-active" : ""}`}
            type="button"
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
