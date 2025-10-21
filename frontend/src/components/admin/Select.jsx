import React from "react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Select({ value, onChange, options, id }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none pr-10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}