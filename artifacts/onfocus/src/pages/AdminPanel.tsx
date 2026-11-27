import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { sendRejectionEmail } from "@/lib/emailjs";

const ADMIN_EMAILS = ["onfocusclub@gmail.com"];
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type Status = "pending" | "approved" | "rejected";

type PortfolioItem = {
  image: string;
  eventName: string;
  about: string;
  genre: string;
  attendees?: number | null;
};

interface Application {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  category: string | null;
  description: string | null;
  price_range: string | null;
  website: string | null;
  portfolio_urls: string[];
  cover_image: string | null;
  profile_image: string | null;
  gallery_urls: string[];
  video_urls: string[];
  media_metadata: Record<string, unknown> | null;
  portfolio_items: PortfolioItem[];
  years_active: number | null;
  events_completed: number | null;
  capacity: number | null;
  tags: string[];
  amenities: string[];
  status: Status;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface EventItem {
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  category: string;
  date: string;
  time: string;
  displayDate?: string | null;
  display_date?: string | null;
  venue: string;
  address?: string | null;
  city: string;
  price?: string | null;
  performerPrice?: number | null;
  performer_price?: number | null;
  audiencePrice?: number | null;
  audience_price?: number | null;
  image?: string | null;
  bannerImage?: string | null;
  banner_image?: string | null;
  tag?: string | null;
  genre?: string | null;
  language?: string | null;
  duration?: string | null;
  artistLineup?: string[] | null;
  artist_lineup?: string[] | null;
  about: string;
  guidelines?: string[] | null;
  featured?: boolean | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminPanel() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const [, navigate] = useLocation();

  // Admin Token state from backend login
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem("onfocus_admin_token");
  });
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("onfocus_admin_user") || "null");
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState("onfocusclub@gmail.com");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Tabs: "events" | "applications"
  const [activeTab, setActiveTab] = useState<"events" | "applications">("events");

  // Partner Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Events Management state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategory, setEventCategory] = useState("all");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Event form fields
  const [eventForm, setEventForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    category: "Music",
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
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
    bannerImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600",
    duration: "2 Hours",
    language: "Hindi / English",
    artistLineup: "",
    about: "",
    guidelines: "1. Please arrive 15 minutes before the event.\n2. Digital pass mandatory at entry.",
    featured: false,
    status: "active",
  });

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const isUserAuthorized =
    Boolean(adminToken) ||
    Boolean(currentUser && ADMIN_EMAILS.includes(currentUser.email ?? ""));

  // Fetch Applications
  const fetchApplications = useCallback(async () => {
    if (!isUserAuthorized) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filterStatus !== "all") params.set("status", filterStatus);
      const res = await fetch(`${API_BASE}/api/partner-applications?${params}`);
      const data = await res.json();
      setApplications(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      showToast("Failed to load applications", false);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, isUserAuthorized]);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    if (!isUserAuthorized) return;
    setEventsLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventCategory !== "all") params.set("category", eventCategory);
      if (eventSearch) params.set("search", eventSearch);
      params.set("limit", "100");

      const res = await fetch(`${API_BASE}/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data.events ?? data ?? []);
    } catch {
      showToast("Failed to load events", false);
    } finally {
      setEventsLoading(false);
    }
  }, [eventCategory, eventSearch, isUserAuthorized]);

  useEffect(() => {
    if (isUserAuthorized) {
      if (activeTab === "applications") fetchApplications();
      if (activeTab === "events") fetchEvents();
    }
  }, [isUserAuthorized, activeTab, fetchApplications, fetchEvents]);

  // Handle Admin Backend Login
  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid admin credentials");
      }

      localStorage.setItem("onfocus_admin_token", data.token);
      localStorage.setItem("onfocus_admin_user", JSON.stringify(data.user));
      setAdminToken(data.token);
      setAdminUser(data.user);
      showToast("Signed in as Admin", true);
    } catch (err: any) {
      setLoginError(err.message || "Failed to log in.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("onfocus_admin_token");
    localStorage.removeItem("onfocus_admin_user");
    setAdminToken(null);
    setAdminUser(null);
    showToast("Logged out", true);
  }

  // Open Event Modal (Create or Edit)
  function openEventModal(event?: EventItem) {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        slug: event.slug,
        subtitle: event.subtitle || "",
        category: event.category || "Music",
        genre: event.genre || "",
        tag: event.tag || "",
        date: event.date,
        time: event.time,
        displayDate: event.displayDate || event.display_date || "",
        venue: event.venue,
        address: event.address || "",
        city: event.city || "Delhi",
        price: event.price || "₹299 onwards",
        performerPrice: event.performerPrice ?? event.performer_price ?? 499,
        audiencePrice: event.audiencePrice ?? event.audience_price ?? 299,
        image: event.image || "",
        bannerImage: event.bannerImage || event.banner_image || "",
        duration: event.duration || "2 Hours",
        language: event.language || "Hindi / English",
        artistLineup: Array.isArray(event.artistLineup || event.artist_lineup)
          ? (event.artistLineup || event.artist_lineup)!.join(", ")
          : "",
        about: event.about || "",
        guidelines: Array.isArray(event.guidelines)
          ? event.guidelines.join("\n")
          : event.guidelines || "",
        featured: Boolean(event.featured),
        status: event.status || "active",
      });
    } else {
      setEditingEvent(null);
      setEventForm({
        title: "",
        slug: "",
        subtitle: "",
        category: "Music",
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
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
        bannerImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600",
        duration: "2 Hours",
        language: "Hindi / English",
        artistLineup: "",
        about: "",
        guidelines: "1. Please arrive 15 minutes before the event.\n2. Digital pass mandatory at entry.",
        featured: false,
        status: "active",
      });
    }
    setIsEventModalOpen(true);
  }

  // Save Event (Create or Edit)
  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    setEventSubmitting(true);

    try {
      const payload = {
        ...eventForm,
        performerPrice: Number(eventForm.performerPrice) || 0,
        audiencePrice: Number(eventForm.audiencePrice) || 0,
        artistLineup: eventForm.artistLineup
          ? eventForm.artistLineup.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        guidelines: eventForm.guidelines
          ? eventForm.guidelines.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminToken) headers["Authorization"] = `Bearer ${adminToken}`;

      let res: Response;
      if (editingEvent) {
        res = await fetch(`${API_BASE}/api/events/${editingEvent.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/api/events`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save event");
      }

      showToast(editingEvent ? "Event updated" : "Event created", true);
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      showToast(err.message || "Failed to save event", false);
    } finally {
      setEventSubmitting(false);
    }
  }

  // Delete Event
  async function handleDeleteEvent() {
    if (!deletingEvent) return;
    setEventSubmitting(true);

    try {
      const headers: Record<string, string> = {};
      if (adminToken) headers["Authorization"] = `Bearer ${adminToken}`;

      const res = await fetch(`${API_BASE}/api/events/${deletingEvent.id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Failed to delete event");
      showToast(`Event deleted`, true);
      setDeletingEvent(null);
      fetchEvents();
    } catch {
      showToast("Failed to delete event", false);
    } finally {
      setEventSubmitting(false);
    }
  }

  // Application Status Update
  async function updateStatus(id: number, status: Status) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/partner-applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes,
          reviewedBy: adminUser?.email || currentUser?.email,
        }),
      });
      if (!res.ok) throw new Error();
      const updated: Application = await res.json();
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSelected(updated);

      if (status === "rejected") {
        try {
          await sendRejectionEmail({
            name: updated.name,
            email: updated.email,
            adminNotes: adminNotes,
          });
        } catch (emailErr) {
          console.error("Rejection email failed:", emailErr);
        }
      }

      showToast(`Application ${status}`, true);
    } catch {
      showToast("Failed to update status", false);
    } finally {
      setActionLoading(false);
    }
  }

  // If auth is still checking
  if (isAuthLoading) {
    return <div className="min-h-screen bg-[#0f0f11]" />;
  }

  // If user is not authorized, render the Admin Login Form
  if (!isUserAuthorized) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-white font-sans flex items-center justify-center p-4">
        <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-md w-full p-8 shadow-2xl">
          <div className="text-center mb-6">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white/80 uppercase tracking-widest">
              Admin Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-3 font-sans">
              OnFocus Administrator
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Sign in with admin credentials to manage live events and partner applications
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Admin Email / Username
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="onfocusclub@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loginLoading ? "Authenticating..." : "Sign In to Admin Panel"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>Default: onfocusclub@gmail.com</span>
            <button
              type="button"
              onClick={() => {
                setLoginEmail("onfocusclub@gmail.com");
                setLoginPassword("admin123");
              }}
              className="text-white/80 hover:text-white underline"
            >
              Fill Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userEmail = adminUser?.email || currentUser?.email || "onfocusclub@gmail.com";

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-2.5 rounded-xl border text-xs font-medium shadow-lg ${
              toast.ok
                ? "bg-emerald-950 text-emerald-200 border-emerald-800"
                : "bg-red-950 text-red-200 border-red-800"
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 font-bold flex items-center justify-center text-xs tracking-wider">
            OF
          </div>
          <span className="text-lg font-semibold tracking-tight">OnFocus Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            <span>Open Standalone Admin Portal (:3001) →</span>
          </a>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 rounded-lg border border-white/10 text-xs text-white/70 hover:bg-white/5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "events"
                ? "bg-white text-zinc-950 shadow-sm"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            Live Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
              activeTab === "applications"
                ? "bg-white text-zinc-950 shadow-sm"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            Partner Applications ({applications.length})
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: LIVE EVENTS MANAGEMENT                                  */}
        {/* ============================================================== */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
                <p className="text-white/40 text-xs mt-1">
                  Add, edit, and delete events shown on the homepage carousel and event pages
                </p>
              </div>

              <button
                onClick={() => openEventModal()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <span>+ Add New Event</span>
              </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <input
                type="text"
                placeholder="Search events by title, venue, genre..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs placeholder:text-white/30 focus:outline-none focus:border-white/30 flex-1 max-w-md"
              />

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {["all", "Music", "Comedy", "Workshop", "Theatre", "Open Mic"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEventCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                      eventCategory === cat
                        ? "bg-white text-zinc-950 font-semibold"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#18181b]/50">
              {eventsLoading ? (
                <div className="p-12 text-center text-xs text-white/40">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="p-12 text-center text-xs text-white/40">
                  No events found. Click "+ Add New Event" to create your first event.
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5 text-white/40 uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Date & Venue</th>
                      <th className="px-4 py-3">Performer / Audience</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                              <img
                                src={
                                  event.image ||
                                  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200"
                                }
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <div className="font-semibold text-white truncate text-sm">
                                {event.title}
                              </div>
                              <div className="text-[10px] text-white/40 font-mono">
                                /{event.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">
                            {event.category}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-white/90">
                            {event.displayDate || event.display_date || event.date} • {event.time}
                          </div>
                          <div className="text-[11px] text-white/40">
                            {event.venue}, {event.city}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-white font-medium">
                            ₹{event.performerPrice ?? event.performer_price ?? 0} / ₹
                            {event.audiencePrice ?? event.audience_price ?? 0}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              (event.status || "active") === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-white/5 text-white/50 border border-white/10"
                            }`}
                          >
                            {event.status || "active"}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openEventModal(event)}
                              className="px-2 py-1 rounded bg-white/5 text-white/80 hover:bg-white/10 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeletingEvent(event)}
                              className="px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PARTNER APPLICATIONS                                    */}
        {/* ============================================================== */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Partner Applications</h1>
              <p className="text-white/40 text-sm mt-1">
                Review, approve, or reject incoming partner requests
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text"
                placeholder="Search by name, email, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30"
              />
              <div className="flex gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilterStatus(s);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                      filterStatus === s
                        ? "bg-white text-zinc-950 font-semibold"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#18181b]/50">
              {loading ? (
                <div className="flex items-center justify-center h-48 text-white/30 text-sm">
                  Loading…
                </div>
              ) : applications.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-white/30 text-sm">
                  No applications found
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/40 uppercase text-xs tracking-widest">
                    <tr>
                      <th className="px-4 py-3 text-left">Business</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Type</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">City</th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell">Submitted</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelected(app);
                          setAdminNotes(app.admin_notes ?? "");
                          setDrawerOpen(true);
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{app.name}</div>
                          <div className="text-white/40 text-xs">{app.email}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell capitalize text-white/60">
                          {app.type}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-white/60">
                          {app.city}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-white/40">
                          {fmtDate(app.submitted_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs border capitalize ${STATUS_STYLES[app.status]}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-white/70 hover:text-white text-xs">
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-sm disabled:opacity-30 hover:bg-white/10"
                >
                  ← Prev
                </button>
                <span className="text-white/40 text-sm">
                  Page {page} / {pagination.pages}
                </span>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-sm disabled:opacity-30 hover:bg-white/10"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ADD / EDIT EVENT MODAL                                         */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-lg font-bold">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h3>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="text-white/40 hover:text-white text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 font-medium mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 font-medium mb-1">Category *</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      className="w-full bg-[#202024] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      {["Music", "Comedy", "Workshop", "Theatre", "Open Mic", "Exhibition", "Dance"].map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 font-medium mb-1">Genre</label>
                    <input
                      type="text"
                      value={eventForm.genre}
                      onChange={(e) => setEventForm({ ...eventForm, genre: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white/70 font-medium mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 font-medium mb-1">Time *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.time}
                      onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 font-medium mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.city}
                      onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 font-medium mb-1">Venue *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 font-medium mb-1">Display Price Tag</label>
                    <input
                      type="text"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 font-medium mb-1">
                      Performer Ticket (₹)
                    </label>
                    <input
                      type="number"
                      value={eventForm.performerPrice}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, performerPrice: Number(e.target.value) })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 font-medium mb-1">
                      Audience Ticket (₹)
                    </label>
                    <input
                      type="number"
                      value={eventForm.audiencePrice}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, audiencePrice: Number(e.target.value) })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1">About the Event *</label>
                  <textarea
                    required
                    rows={3}
                    value={eventForm.about}
                    onChange={(e) => setEventForm({ ...eventForm, about: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={eventSubmitting}
                    className="px-5 py-2 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {eventSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-md w-full p-6 text-xs">
            <h3 className="text-base font-bold text-white mb-2">Delete Event</h3>
            <p className="text-white/60 mb-4">
              Are you sure you want to delete “{deletingEvent.title}”? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingEvent(null)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={eventSubmitting}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {eventSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
