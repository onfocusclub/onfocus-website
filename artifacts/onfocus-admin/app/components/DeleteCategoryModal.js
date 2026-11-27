"use client";

import { TrashIcon, XIcon } from "./Icons";

export default function DeleteCategoryModal({ isOpen, category, isDeleting, onConfirm, onCancel }) {
  if (!isOpen || !category) return null;

  const eventCount = category.eventsCount || 0;

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

        <h3 className="text-lg font-bold text-zinc-950 font-sans">Delete Category</h3>
        <p className="text-sm text-zinc-600 mt-2">
          Are you sure you want to delete the category{" "}
          <span className="font-semibold text-zinc-900">“{category.name}”</span>?
        </p>

        {eventCount > 0 ? (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="font-semibold">Notice: Active Events Linked</div>
            <div>
              There are currently <span className="font-bold">{eventCount}</span> event(s) assigned to this category. Deleting this category will remove it from the filter lists.
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs text-zinc-600 space-y-1">
            <div><span className="font-medium text-zinc-700">Slug:</span> {category.slug}</div>
            {category.description && (
              <div><span className="font-medium text-zinc-700">Description:</span> {category.description}</div>
            )}
          </div>
        )}

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
              "Yes, Delete Category"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
