import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Close">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
