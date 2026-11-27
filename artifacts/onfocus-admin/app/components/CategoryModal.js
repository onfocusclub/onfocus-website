"use client";

import { useState, useEffect } from "react";
import { XIcon } from "./Icons";

export default function CategoryModal({
  isOpen,
  mode = "add", // "add" | "edit"
  categoryData = null,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    displayOrder: 1,
    isActive: true,
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (mode === "edit" && categoryData) {
      setFormData({
        name: categoryData.name || "",
        slug: categoryData.slug || "",
        description: categoryData.description || "",
        icon: categoryData.icon || "",
        displayOrder: categoryData.displayOrder ?? categoryData.display_order ?? 1,
        isActive: categoryData.isActive !== undefined ? Boolean(categoryData.isActive) : true,
      });
    } else if (mode === "add") {
      setFormData({
        name: "",
        slug: "",
        description: "",
        icon: "",
        displayOrder: 1,
        isActive: true,
      });
    }
    setFormError("");
  }, [mode, categoryData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Category Name is required.");
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description.trim() || null,
      icon: formData.icon.trim() || null,
      displayOrder: Number(formData.displayOrder) || 0,
      isActive: Boolean(formData.isActive),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 font-sans">
              {mode === "edit" ? "Edit Event Category" : "Add Event Category"}
            </h2>
            <p className="text-xs text-zinc-500">
              {mode === "edit"
                ? `Updating category "${categoryData?.name}" (#${categoryData?.id})`
                : "Create a new category for event classification and filters"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {formError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Comedy, Indie Music, Photography"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Slug (Optional, auto-generated if left blank)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g. comedy, indie-music"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description of events under this category..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span className="text-xs font-medium text-zinc-800">
                  Active (Visible on public site)
                </span>
              </label>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : mode === "edit" ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
