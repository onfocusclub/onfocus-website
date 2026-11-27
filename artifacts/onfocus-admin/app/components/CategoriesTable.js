"use client";

import { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  SearchIcon,
  RefreshIcon,
  PlusIcon,
  TagIcon,
} from "./Icons";

export default function CategoriesTable({
  categories = [],
  isLoading = false,
  onRefresh,
  onAddNew,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none placeholder:text-zinc-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh categories"
            disabled={isLoading}
            className="p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {isLoading && categories.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto mb-3" />
            Loading event categories...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <TagIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">No categories found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {search
                ? "No categories match your search criteria."
                : "No event categories configured yet. Click 'Add Category' to create one."}
            </p>
            <div className="mt-4">
              <button
                onClick={onAddNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Create First Category</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category Name & Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Events Linked</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                {filtered.map((cat) => {
                  const isActive = cat.isActive !== false && cat.is_active !== false;
                  const eventCount = cat.eventsCount ?? 0;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-zinc-50/60 transition-colors group"
                    >
                      {/* Display Order */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-400">
                        #{cat.displayOrder ?? cat.display_order ?? 0}
                      </td>

                      {/* Name & Slug */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-zinc-950 text-sm">
                          {cat.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          slug: {cat.slug}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-zinc-600 line-clamp-2">
                          {cat.description || "—"}
                        </p>
                      </td>

                      {/* Linked Events */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {eventCount} event{eventCount === 1 ? "" : "s"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-500 border-zinc-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-zinc-400"
                            }`}
                          />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(cat)}
                            title="Edit Category"
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(cat)}
                            title="Delete Category"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
