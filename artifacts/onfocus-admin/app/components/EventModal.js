"use client";

import { useState, useEffect } from "react";
import { XIcon, SparklesIcon, CloudUploadIcon, CheckIcon } from "./Icons";
import { uploadEventImage } from "../lib/api";

const CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Goa",
  "Kolkata",
  "Chennai",
  "Jaipur",
  "Chandigarh",
  "Lucknow",
  "Jhansi",
];

export default function EventModal({
  isOpen,
  mode = "add", // "add" | "edit"
  eventData = null,
  isSubmitting = false,
  categories = [],
  adminToken = null,
  onClose,
  onSubmit,
}) {
  const availableCategories =
    categories.length > 0
      ? categories.map((c) => (typeof c === "string" ? c : c.name))
      : [];

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subtitle: "",
    category: availableCategories[0] || "",
    genre: "Live Gig",
    tag: "Trending",
    date: "",
    time: "07:00 PM",
    displayDate: "",
    venue: "",
    address: "",
    city: "Delhi",
    price: "₹299 onwards",
    performerPrice: 499,
    audiencePrice: 299,
    image: "",
    bannerImage: "",
    duration: "2 Hours",
    language: "Hindi / English",
    artistLineup: "",
    about: "",
    guidelines: "1. Please arrive 15 minutes before the scheduled time.\n2. Digital pass mandatory at entry.\n3. Outside food and beverages strictly prohibited.",
    featured: false,
    status: "active",
  });

  const [formError, setFormError] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState("");
  const [bannerUploadError, setBannerUploadError] = useState("");

  // Populate form if in edit mode
  useEffect(() => {
    if (mode === "edit" && eventData) {
      setFormData({
        title: eventData.title || "",
        slug: eventData.slug || "",
        subtitle: eventData.subtitle || "",
        category: eventData.category || (availableCategories[0] || ""),
        genre: eventData.genre || "",
        tag: eventData.tag || "",
        date: eventData.date || "",
        time: eventData.time || "07:00 PM",
        displayDate: eventData.displayDate || eventData.display_date || "",
        venue: eventData.venue || "",
        address: eventData.address || "",
        city: eventData.city || "Delhi",
        price: eventData.price || "₹299 onwards",
        performerPrice: eventData.performerPrice ?? eventData.performer_price ?? 499,
        audiencePrice: eventData.audiencePrice ?? eventData.audience_price ?? 299,
        image: eventData.image || "",
        bannerImage: eventData.bannerImage || eventData.banner_image || "",
        duration: eventData.duration || "2 Hours",
        language: eventData.language || "Hindi / English",
        artistLineup: Array.isArray(eventData.artistLineup || eventData.artist_lineup)
          ? (eventData.artistLineup || eventData.artist_lineup).join(", ")
          : "",
        about: eventData.about || "",
        guidelines: Array.isArray(eventData.guidelines)
          ? eventData.guidelines.join("\n")
          : eventData.guidelines || "",
        featured: Boolean(eventData.featured),
        status: eventData.status || "active",
      });
    } else if (mode === "add") {
      setFormData({
        title: "",
        slug: "",
        subtitle: "",
        category: availableCategories[0] || "",
        genre: "Live Gig",
        tag: "Trending",
        date: new Date().toISOString().split("T")[0],
        time: "07:00 PM",
        displayDate: "",
        venue: "",
        address: "",
        city: "Delhi",
        price: "₹299 onwards",
        performerPrice: 499,
        audiencePrice: 299,
        image: "",
        bannerImage: "",
        duration: "2 Hours",
        language: "Hindi / English",
        artistLineup: "",
        about: "",
        guidelines: "1. Please arrive 15 minutes before the scheduled time.\n2. Digital pass mandatory at entry.\n3. Outside food and beverages strictly prohibited.",
        featured: false,
        status: "active",
      });
    }
    setFormError("");
    setThumbnailUploadError("");
    setBannerUploadError("");
  }, [mode, eventData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileSelect = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "image") {
      setIsUploadingThumbnail(true);
      setThumbnailUploadError("");
    } else {
      setIsUploadingBanner(true);
      setBannerUploadError("");
    }

    try {
      const res = await uploadEventImage(file, adminToken);
      if (res && res.url) {
        setFormData((prev) => ({
          ...prev,
          [field]: res.url,
          ...(field === "image" && !prev.bannerImage ? { bannerImage: res.url } : {}),
        }));
      } else {
        throw new Error("No URL returned from Cloudinary upload");
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      if (field === "image") {
        setThumbnailUploadError(err?.message || "Failed to upload image. Please try again.");
      } else {
        setBannerUploadError(err?.message || "Failed to upload banner. Please try again.");
      }
    } finally {
      if (field === "image") {
        setIsUploadingThumbnail(false);
      } else {
        setIsUploadingBanner(false);
      }
      e.target.value = "";
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Event Title is required.");
      return;
    }
    if (!formData.date.trim()) {
      setFormError("Event Date is required.");
      return;
    }
    if (!formData.venue.trim()) {
      setFormError("Venue is required.");
      return;
    }
    if (!formData.about.trim()) {
      setFormError("Event description / About is required.");
      return;
    }
    if (!formData.image) {
      setFormError("Event Card Thumbnail is required. Please upload an image from your device.");
      return;
    }
    if (isUploadingThumbnail || isUploadingBanner) {
      setFormError("Images are currently uploading to Cloudinary. Please wait a moment.");
      return;
    }

    const payload = {
      ...formData,
      bannerImage: formData.bannerImage || formData.image,
      performerPrice: Number(formData.performerPrice) || 0,
      audiencePrice: Number(formData.audiencePrice) || 0,
      artistLineup: formData.artistLineup
        ? formData.artistLineup.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      guidelines: formData.guidelines
        ? formData.guidelines.split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 font-sans">
              {mode === "edit" ? "Edit Event" : "Create New Event"}
            </h2>
            <p className="text-xs text-zinc-500">
              {mode === "edit"
                ? `Updating event ID #${eventData?.id} (${eventData?.slug})`
                : "Add an event to the Onfocus platform and ticketing system"}
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
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Basic Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Delhi Indie Music Showcase"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Custom Slug (optional)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="auto-generated-if-blank"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="e.g. Live acoustic session & open stage"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                >
                  {availableCategories.length === 0 ? (
                    <option value="">No categories yet (Create in Categories tab first)</option>
                  ) : (
                    availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Genre / Sub-type
                </label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="e.g. Standup / Acoustic / Improv"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="e.g. Trending, Fast Filling, New"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Draft / Hidden)</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date, Time & Location */}
          <div className="pt-4 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              2. Date, Time & Venue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Date (YYYY-MM-DD) *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Time *
                </label>
                <input
                  type="text"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g. 07:00 PM"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Display Date (Formatted)
                </label>
                <input
                  type="text"
                  name="displayDate"
                  value={formData.displayDate}
                  onChange={handleChange}
                  placeholder="e.g. Sun, 24 Nov 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. The Habitat, Khar"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 1st Floor, Omaxe Square, Jasola District Centre"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Ticketing & Pricing */}
          <div className="pt-4 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              3. Ticketing & Category Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Display Price Tag
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. ₹299 onwards"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Performer Ticket Price (₹)
                </label>
                <input
                  type="number"
                  name="performerPrice"
                  value={formData.performerPrice}
                  onChange={handleChange}
                  placeholder="499"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Audience Ticket Price (₹)
                </label>
                <input
                  type="number"
                  name="audiencePrice"
                  value={formData.audiencePrice}
                  onChange={handleChange}
                  placeholder="299"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Media & Artwork: Device Upload to Cloudinary */}
          <div className="pt-4 border-t border-zinc-100">
            <div className="mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                4. Event Images (Upload from Device to Cloudinary)
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Choose images directly from your device. All files are automatically uploaded and optimized via Cloudinary CDN.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Thumbnail */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700">
                    Card Thumbnail Image *
                  </label>
                  <span className="text-[10px] text-zinc-400 font-medium">Square or Poster (e.g. 600×600)</span>
                </div>

                {formData.image ? (
                  <div className="relative rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 group">
                    <img
                      src={formData.image}
                      alt="Thumbnail Preview"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-zinc-950/80 text-emerald-400 rounded-md text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                      <CheckIcon className="w-3 h-3 text-emerald-400" />
                      <span>Cloudinary Uploaded</span>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white text-zinc-900 rounded-xl text-xs font-semibold hover:bg-zinc-100 shadow-sm transition-all">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingThumbnail}
                          onChange={(e) => handleFileSelect(e, "image")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 shadow-sm transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                      isUploadingThumbnail
                        ? "border-zinc-400 bg-zinc-50 pointer-events-none"
                        : "border-zinc-300 hover:border-zinc-900 bg-zinc-50/50 hover:bg-zinc-50"
                    }`}
                  >
                    {isUploadingThumbnail ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mb-2" />
                        <p className="text-xs font-semibold text-zinc-800">Uploading to Cloudinary...</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Please wait a moment</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mb-2">
                          <CloudUploadIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-900">
                          Click to browse image from device
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          JPG, PNG, WEBP up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingThumbnail}
                      onChange={(e) => handleFileSelect(e, "image")}
                    />
                  </label>
                )}
                {thumbnailUploadError && (
                  <p className="text-[11px] text-red-600 mt-1.5 font-medium">{thumbnailUploadError}</p>
                )}
              </div>

              {/* Hero Banner */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700">
                    Hero Header Banner
                  </label>
                  <span className="text-[10px] text-zinc-400 font-medium">Wide 16:9 (e.g. 1600×900)</span>
                </div>

                {formData.bannerImage ? (
                  <div className="relative rounded-2xl border border-zinc-200 overflow-hidden bg-zinc-50 group">
                    <img
                      src={formData.bannerImage}
                      alt="Banner Preview"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-zinc-950/80 text-emerald-400 rounded-md text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs">
                      <CheckIcon className="w-3 h-3 text-emerald-400" />
                      <span>Cloudinary Uploaded</span>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white text-zinc-900 rounded-xl text-xs font-semibold hover:bg-zinc-100 shadow-sm transition-all">
                        Change Banner
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingBanner}
                          onChange={(e) => handleFileSelect(e, "bannerImage")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, bannerImage: "" }))}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 shadow-sm transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                      isUploadingBanner
                        ? "border-zinc-400 bg-zinc-50 pointer-events-none"
                        : "border-zinc-300 hover:border-zinc-900 bg-zinc-50/50 hover:bg-zinc-50"
                    }`}
                  >
                    {isUploadingBanner ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mb-2" />
                        <p className="text-xs font-semibold text-zinc-800">Uploading to Cloudinary...</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Please wait a moment</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mb-2">
                          <CloudUploadIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-900">
                          Click to browse banner from device
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Optional: will fallback to thumbnail
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingBanner}
                      onChange={(e) => handleFileSelect(e, "bannerImage")}
                    />
                  </label>
                )}
                {bannerUploadError && (
                  <p className="text-[11px] text-red-600 mt-1.5 font-medium">{bannerUploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="pt-4 border-t border-zinc-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              5. Event Content & Description
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 2 Hours"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="e.g. Hindi / English"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Artist Lineup (comma-separated)
                </label>
                <input
                  type="text"
                  name="artistLineup"
                  value={formData.artistLineup}
                  onChange={handleChange}
                  placeholder="e.g. Kabir Cafe, Local Bands"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                About the Event *
              </label>
              <textarea
                name="about"
                required
                rows={4}
                value={formData.about}
                onChange={handleChange}
                placeholder="Write a clear, exciting summary of the event..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Guidelines / Rules (one per line)
              </label>
              <textarea
                name="guidelines"
                rows={3}
                value={formData.guidelines}
                onChange={handleChange}
                placeholder="1. Entry allows 1 person per pass..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured-checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <label htmlFor="featured-checkbox" className="text-sm font-medium text-zinc-800">
                Feature on Homepage Carousel
              </label>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-6 border-t border-zinc-200 flex items-center justify-end gap-3">
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
                  <span>Saving Event...</span>
                </>
              ) : mode === "edit" ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
