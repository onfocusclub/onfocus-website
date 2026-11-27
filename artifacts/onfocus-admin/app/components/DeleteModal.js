"use client";

import { TrashIcon, XIcon } from "./Icons";

export default function DeleteModal({ isOpen, event, isDeleting, onConfirm, onCancel }) {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 mb-4">
            <TrashIcon className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-zinc-950 font-sans">Delete Event</h3>
        <p className="text-sm text-zinc-600 mt-2">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-zinc-900">“{event.title}”</span>? This
          will remove the event from the live website immediately.
        </p>

        <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs text-zinc-600 space-y-1">
          <div><span className="font-medium text-zinc-700">Category:</span> {event.category}</div>
          <div><span className="font-medium text-zinc-700">Date:</span> {event.date} • {event.time}</div>
          <div><span className="font-medium text-zinc-700">Venue:</span> {event.venue}, {event.city}</div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              "Yes, Delete Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
