"use client";

import {
  PencilIcon,
  TrashIcon,
  SearchIcon,
  CalendarIcon,
  MapPinIcon,
  ExternalLinkIcon,
  TagIcon,
  RefreshIcon,
  PlusIcon,
} from "./Icons";

export default function EventsTable({
  events = [],
  categories = [],
  isLoading = false,
  searchTerm = "",
  selectedCategory = "all",
  selectedCity = "all",
  onSearchChange,
  onCategoryChange,
  onCityChange,
  onRefresh,
  onAddNew,
  onEdit,
  onDelete,
}) {
  const categoryList = [
    "all",
    ...categories.map((c) => (typeof c === "string" ? c : c.name)),
  ];

  const cities = Array.from(
    new Set(events.map((e) => e.city).filter(Boolean))
  ).sort();

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events by title, venue, genre..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none placeholder:text-zinc-400"
          />
        </div>

        {/* City Filter & Refresh & Add button */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 bg-white focus:outline-none focus:border-zinc-900"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onRefresh}
            title="Refresh events list"
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
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Shown only when categories exist) */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoryList.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Events Table Container */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {isLoading && events.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto mb-3" />
            Loading events from database...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900">No events found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              There are no events matching your current filters or in the system yet. Click "Add Event" to create one.
            </p>
            <div className="mt-4">
              <button
                onClick={onAddNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Create First Event</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category & Tag</th>
                  <th className="py-3 px-4">Schedule & Venue</th>
                  <th className="py-3 px-4">Pricing (Perf / Aud)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                {events.map((event) => {
                  const slug = event.slug || String(event.id);
                  const isFeatured = Boolean(event.featured);
                  const isActive = (event.status || "active") === "active";

                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-zinc-50/60 transition-colors group"
                    >
                      {/* Event Banner & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                            <img
                              src={
                                event.image ||
                                "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300"
                              }
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300";
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-zinc-950 truncate text-sm">
                                {event.title}
                              </span>
                              {isFeatured && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                  ★ Featured
                                </span>
                              )}
                            </div>
                            {event.subtitle && (
                              <p className="text-[11px] text-zinc-500 truncate">
                                {event.subtitle}
                              </p>
                            )}
                            <span className="text-[10px] text-zinc-400 font-mono">
                              #{event.id} • /{event.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Tag */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium border border-zinc-200">
                            {event.category}
                          </span>
                          {event.tag && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 font-semibold border border-red-100">
                              <TagIcon className="w-2.5 h-2.5" />
                              {event.tag}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Schedule & Venue */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-900">
                            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                            <span>
                              {event.displayDate || event.display_date || event.date}
                            </span>
                            <span className="text-zinc-400">• {event.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                            <MapPinIcon className="w-3 h-3 text-zinc-400" />
                            <span className="truncate max-w-[180px]">
                              {event.venue}, {event.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-zinc-900">
                            Perf: ₹{event.performerPrice ?? event.performer_price ?? 0}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Aud: ₹{event.audiencePrice ?? event.audience_price ?? 0}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-zinc-400"
                            }`}
                          />
                          {event.status || "active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Live view button */}
                          <a
                            href={`http://localhost:5173/event/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on public site"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => onEdit(event)}
                            title="Edit Event"
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => onDelete(event)}
                            title="Delete Event"
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
