import React from "react";

export default function Select({ value, onChange, options, id }) {
  return (
    <div className="select-wrapper">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="select-caret" aria-hidden>▾</span>
    </div>
  );
}
